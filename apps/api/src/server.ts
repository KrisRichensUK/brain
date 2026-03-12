import crypto from "node:crypto";
import "dotenv/config";
import express from "express";
import { z } from "zod";
import { AffixClient } from "@proof-of-access/affix-client/src/client";
import { AccessRequestSchema } from "@proof-of-access/domain/src";
import { normaliseSources } from "./normalise.js";

const app = express();
app.use(express.json());

const sourceConfigSchema = z.array(
  z.object({
    source: z.string(),
    response: z.record(z.any())
  })
);

const affix = new AffixClient(process.env.AFFIX_BASE_URL ?? "https://api.affix-io.com", process.env.AFFIX_API_KEY ?? "dev-key");

app.post("/access/check", async (req, res) => {
  try {
    const { identifier, venueId, action } = AccessRequestSchema.parse(req.body);
    const configured = sourceConfigSchema.parse(req.body.mockSources ?? []);

    const rawSources = Object.fromEntries(configured.map((s) => [s.source, s.response]));
    const sources = normaliseSources(rawSources);

    const eligibility = await affix.eligibilityCheck({
      identifier,
      venueId,
      action,
      dataSources: sources,
      rules: req.body.rules ?? {
        name: "default-gate",
        conditions: [{ field: "blacklist.blocked", operator: "eq", value: false }]
      }
    });

    if (!eligibility.eligible) {
      return res.status(403).json({ eligible: false, reason: "not_eligible", eligibility });
    }

    const token = await affix.generateToken({
      subject: identifier,
      scope: [action],
      resource: venueId,
      expiresInSeconds: 90
    });

    const proof = await affix.generateProof({
      userId: identifier,
      rules: { venueId, action, decision: "eligible" },
      data: sources
    });

    const audit = await affix.auditProof({
      eventId: crypto.randomUUID(),
      identifierHash: crypto.createHash("sha256").update(identifier).digest("hex"),
      venueId,
      action,
      decision: "eligible",
      tokenId: token?.tokenId ?? null,
      proofId: proof?.proofId ?? null
    });

    return res.json({ eligible: true, token, proof, audit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "invalid_request", details: error.flatten() });
    }
    const message = error instanceof Error ? error.message : "unknown_error";
    return res.status(500).json({ error: message });
  }
});

app.post("/access/validate-token", async (req, res) => {
  try {
    const token = z.string().min(1).parse(req.body.token);
    const result = await affix.validateToken({ token });
    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return res.status(400).json({ error: message });
  }
});

app.listen(3000, () => {
  console.log("API listening on :3000");
});
