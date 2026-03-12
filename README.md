# Proof-of-Access Blueprint (AffixIO + Certiqo)

This repository contains a TypeScript monorepo blueprint for a **Proof-of-Access Economy** system using AffixIO endpoints and a stateless eligibility model.

## Core pattern

`External source -> adapter -> eligibility decision -> signed token/proof -> controller unlocks door`

## Monorepo layout

- `apps/api`: Access Orchestrator (Express) with `POST /access/check` and `POST /access/validate-token`.
- `apps/web`: Admin/check-in starter UI for connector + logic tree configuration.
- `apps/edge-controller`: token validation client that prints `UNLOCK DOOR` on valid token.
- `packages/affix-client`: typed AffixIO client wrappers.
- `packages/adapters`: pluggable source adapter layer and unified fetch contract.
- `packages/domain`: strict zod domain schemas (including canonical `AccessContext`).
- `packages/rules`: logic tree types for composite policy evaluation.

## API flow implemented

1. Receive `identifier`, `venueId`, `action`.
2. Fetch and normalise source data into canonical shape.
3. Call AffixIO eligibility API.
4. If eligible, generate token and proof.
5. Write pseudonymised audit artifact.
6. Return `{ eligible, token, proof, audit }`.

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Infrastructure + data

- `docker-compose.yml` boots PostgreSQL and Redis.
- `scripts/init.sql` seeds core config/event tables.
- `examples/curl-examples.sh` shows eligibility request format.

## Recommended MVP sources

Start with:

- PostgreSQL membership DB
- REST payment API
- CSV blacklist feed

Then use:

- `/api/eligibility/check`
- `/api/tokens/generate`
- `/api/tokens/validate`
- `/api/proof/generate`

## Security principle

Door controllers should validate only signed credentials; they should not hold external database credentials. The orchestrator owns adapters and source integrations.
