"""Pydantic models and dataclasses used by the service."""
from __future__ import annotations

import base64
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, root_validator


@dataclass
class StoredSeal:
    """Representation of a sealed idea stored on disk."""

    content_hash: str
    created_at: datetime
    salt: str
    signature: str
    storage_ref: str

    def to_dict(self) -> dict[str, str]:
        return {
            "content_hash": self.content_hash,
            "created_at": self.created_at.isoformat(),
            "salt": self.salt,
            "signature": self.signature,
            "storage_ref": self.storage_ref,
        }


class SealRequest(BaseModel):
    """Request payload for sealing an idea."""

    text: Optional[str] = Field(None, description="Plain text idea content.")
    blob: Optional[str] = Field(
        None,
        description="Base64-encoded binary idea content (image, audio, etc.).",
    )
    salt: Optional[str] = Field(None, description="Optional caller-provided salt.")

    @root_validator
    def ensure_content_present(cls, values: dict) -> dict:
        text, blob = values.get("text"), values.get("blob")
        if not text and not blob:
            raise ValueError("either 'text' or 'blob' must be provided")
        return values

    def content_bytes(self) -> bytes:
        if self.text is not None:
            return self.text.encode("utf-8")
        assert self.blob is not None
        return base64.b64decode(self.blob)


class SealResponse(BaseModel):
    content_hash: str
    created_at: str
    salt: str
    signature: str
    storage_ref: str


class ProofRequest(BaseModel):
    content_hash: str


class ProofResponse(BaseModel):
    content_hash: str
    proof: str
    proof_type: str = Field(
        "deterministic-placeholder",
        description="Identifier describing the proof construction used.",
    )


class VerifyRequest(BaseModel):
    content_hash: str
    proof: str


class VerifyResponse(BaseModel):
    valid: bool
    detail: str
