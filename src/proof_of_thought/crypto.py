"""Cryptographic helpers for hashing and signing sealed content."""
from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timezone
from typing import Optional

from . import config

DOMAIN_SEPARATOR = "proof-of-thought::v1"


def generate_salt(length: int = 16) -> str:
    """Return a hex-encoded cryptographically-secure salt."""
    return secrets.token_hex(length)


def current_timestamp() -> datetime:
    """Return the current UTC timestamp."""
    return datetime.now(timezone.utc)


def hash_payload(content: bytes, salt: str, created_at: datetime) -> str:
    """Hash the payload along with metadata for replay protection."""
    hasher = hashlib.sha256()
    hasher.update(DOMAIN_SEPARATOR.encode("utf-8"))
    hasher.update(salt.encode("utf-8"))
    hasher.update(created_at.isoformat().encode("utf-8"))
    hasher.update(content)
    return hasher.hexdigest()


def sign_hash(content_hash: str, *, secret: Optional[str] = None) -> str:
    """Return a deterministic signature over the content hash."""
    key = secret or config.secret_key()
    digest = hmac.new(key.encode("utf-8"), msg=content_hash.encode("utf-8"), digestmod=hashlib.sha256)
    return digest.hexdigest()


def verify_signature(content_hash: str, signature: str, *, secret: Optional[str] = None) -> bool:
    """Check that the signature matches the supplied content hash."""
    expected = sign_hash(content_hash, secret=secret)
    return hmac.compare_digest(expected, signature)


def placeholder_proof(signature: str) -> str:
    """Return a deterministic placeholder proof from the signature."""
    return base64.b64encode(signature.encode("utf-8")).decode("utf-8")


def verify_placeholder_proof(content_hash: str, proof: str, *, secret: Optional[str] = None) -> bool:
    """Validate the placeholder proof by re-deriving the signature."""
    try:
        signature = base64.b64decode(proof.encode("utf-8"), validate=True).decode("utf-8")
    except (ValueError, UnicodeDecodeError):
        return False
    return verify_signature(content_hash, signature, secret=secret)
