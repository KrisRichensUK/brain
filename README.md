# Proof of Thought

A minimal implementation of the Proof of Thought workflow for sealing ideas with a timestamped hash, generating a deterministic placeholder proof, and verifying that proof later without revealing the idea itself.

## Features

- **Seal** arbitrary text or binary content via `/seal`, producing a salted SHA-256 hash, timestamp, and HMAC signature.
- **Prove** ownership later via `/prove`, which derives a deterministic placeholder proof from the stored signature.
- **Verify** proofs via `/verify`, confirming that a supplied proof matches the stored signature for a given hash.
- Persists sealed records as JSON inside a configurable data directory (`POT_DATA_DIR`).

## Getting started

1. Create and activate a virtual environment (optional but recommended).
2. Install dependencies:

   ```bash
   pip install -e .[dev]
   ```

3. Launch the API locally:

   ```bash
   uvicorn proof_of_thought:app --reload
   ```

   The interactive docs are available at [http://localhost:8000/docs](http://localhost:8000/docs).

## Configuration

- `POT_DATA_DIR` — directory where seal records are stored (defaults to `./data`).
- `POT_SECRET_KEY` — secret used to sign content hashes; defaults to a local development value.

## Running tests

```bash
pytest
```

## Relationship to CODEX

`CODEX.md` captures the product vision, while this repository now provides a working reference implementation of the hashing, proof generation, and verification workflow described there.
