# Proof of Thought — ZKP for Human Creativity

## What it is (simple words)
Prove you had an idea first — without showing the idea.  
You keep it secret now. You can reveal it later.  
Only a phone or computer needed.

## Why it matters
- Protects art, designs, notes, research.
- Works like a time-stamped lockbox.
- Private: shows proof, not the idea.

## How it works (short steps)
1) You type, draw, or record your idea in the app.  
2) The app makes a **hash** (a scrambled fingerprint).  
3) It creates a **Zero-Knowledge Proof (ZKP)** that says:
   - “I know the thing that makes this hash.”
   - “I knew it at this time.”
   - “I won’t show the thing yet.”
4) Store the proof:
   - Option A: on a public chain (cheap, minimal data).
   - Option B: locally + mirror to cloud or Git.
5) Later, you reveal the idea; anyone checks the hash + proof.

## MVP you can build today (no extra hardware)
- Web/mobile app UI (text area, image/audio upload).  
- Hashing: SHA-256 of content + metadata (time, device).  
- Simple proof today: publish (hash, timestamp, signature).  
- Stretch: add real ZK (Circom/Halo2 → snarkjs proof).

## Data model (plain)
- content_hash: hex  
- created_at: ISO time  
- salt: random string  
- zk_proof: bytes/base64 (optional at v1)  
- pub_key: for signatures  
- storage_ref: IPFS/Git commit/tx id (pick one)

## Minimal API (JSON)
POST /seal
- in: { blob|text, salt? }
- out: { content_hash, created_at, signature, storage_ref }

POST /prove
- in: { content_hash }
- out: { zk_proof }

POST /verify
- in: { content_hash, zk_proof }
- out: { valid: true/false }

## Circuits (v2 idea)
- Statement: “I know M such that SHA256(M || salt) = H”
- Public: H
- Private: M, salt
- Use recursive proofs to batch many seals.

## Threat model (short)
- Can’t guess idea from the hash or proof.  
- Replays blocked: include time + domain in the hash preimage.  
- Collision risk: negligible with SHA-256 + salt.

## UX for dyslexic thinkers
- Big buttons, short lines, icons.  
- Steps as cards: **Seal → Save → Prove → Verify**.  
- Progress dots, plain words, no jargon in UI.

## License + ethics
- Default: user owns idea; app never stores raw content without consent.  
- Optional public registry for open-source ideas.

## Next steps
- Build v1: hash + timestamp + signature + Git/IPFS pin.  
- Add ZK circuit later for non-disclosure verification.  
- Write tests for hash stability and verify flow.

