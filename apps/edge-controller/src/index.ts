import axios from "axios";

async function validateAndUnlock(token: string) {
  const base = process.env.AFFIX_BASE_URL ?? "https://api.affix-io.com";
  const apiKey = process.env.AFFIX_API_KEY ?? "dev-key";

  const { data } = await axios.post(
    `${base}/api/tokens/validate`,
    { token },
    { headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" } }
  );

  if (!data.valid) {
    console.log("Token invalid");
    return;
  }

  console.log("UNLOCK DOOR");
}

const token = process.argv[2];
if (!token) {
  console.error("usage: npm run dev -- <token>");
  process.exit(1);
}

validateAndUnlock(token).catch((error) => {
  console.error(error);
  process.exit(1);
});
