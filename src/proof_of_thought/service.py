"""Core application logic for Proof of Thought."""
from __future__ import annotations

from . import crypto
from .models import (
    ProofRequest,
    ProofResponse,
    SealRequest,
    SealResponse,
    StoredSeal,
    VerifyRequest,
    VerifyResponse,
)
from .storage import get_seal_by_hash, persist_seal


class SealNotFoundError(Exception):
    """Raised when a seal cannot be located in storage."""


def seal_idea(request: SealRequest) -> SealResponse:
    """Seal the provided content and persist the record."""
    created_at = crypto.current_timestamp()
    salt = request.salt or crypto.generate_salt()
    content_hash = crypto.hash_payload(request.content_bytes(), salt, created_at)
    signature = crypto.sign_hash(content_hash)
    stored = persist_seal(
        StoredSeal(
            content_hash=content_hash,
            created_at=created_at,
            salt=salt,
            signature=signature,
            storage_ref="",
        )
    )
    return SealResponse(
        content_hash=stored.content_hash,
        created_at=stored.created_at.isoformat(),
        salt=stored.salt,
        signature=stored.signature,
        storage_ref=stored.storage_ref,
    )


def create_proof(request: ProofRequest) -> ProofResponse:
    """Create a deterministic placeholder proof for the supplied hash."""
    seal = get_seal_by_hash(request.content_hash)
    if seal is None:
        raise SealNotFoundError(f"No sealed record found for hash {request.content_hash}")
    proof = crypto.placeholder_proof(seal.signature)
    return ProofResponse(content_hash=seal.content_hash, proof=proof)


def verify_proof(request: VerifyRequest) -> VerifyResponse:
    """Verify the supplied placeholder proof for a content hash."""
    seal = get_seal_by_hash(request.content_hash)
    if seal is None:
        return VerifyResponse(valid=False, detail="unknown content hash")
    is_valid = crypto.verify_placeholder_proof(request.content_hash, request.proof)
    detail = "proof matches stored signature" if is_valid else "proof mismatch"
    return VerifyResponse(valid=is_valid, detail=detail)
