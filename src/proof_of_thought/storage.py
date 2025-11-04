"""Simple JSON-file storage for sealed ideas."""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Iterable, Optional

from . import config
from .models import StoredSeal


SEALS_SUBDIR = "seals"


def _seals_dir(base_dir: Optional[Path] = None) -> Path:
    base = config.ensure_data_dir(base_dir)
    path = base / SEALS_SUBDIR
    path.mkdir(parents=True, exist_ok=True)
    return path


def persist_seal(seal: StoredSeal, base_dir: Optional[Path] = None) -> StoredSeal:
    """Persist the seal to disk and return an updated copy including storage ref."""
    seals_dir = _seals_dir(base_dir)
    filename = f"{seal.created_at.strftime('%Y%m%dT%H%M%S%fZ')}_{seal.content_hash[:12]}.json"
    path = seals_dir / filename
    payload = seal.to_dict()
    payload["storage_ref"] = f"{SEALS_SUBDIR}/{filename}"
    path.write_text(json.dumps(payload, indent=2))
    return StoredSeal(
        content_hash=seal.content_hash,
        created_at=seal.created_at,
        salt=seal.salt,
        signature=seal.signature,
        storage_ref=payload["storage_ref"],
    )


def iter_seals(base_dir: Optional[Path] = None) -> Iterable[StoredSeal]:
    """Yield all stored seals from disk."""
    seals_dir = _seals_dir(base_dir)
    for path in sorted(seals_dir.glob("*.json")):
        data = json.loads(path.read_text())
        yield StoredSeal(
            content_hash=data["content_hash"],
            created_at=datetime.fromisoformat(data["created_at"]),
            salt=data["salt"],
            signature=data["signature"],
            storage_ref=data["storage_ref"],
        )


def get_seal_by_hash(content_hash: str, base_dir: Optional[Path] = None) -> Optional[StoredSeal]:
    """Return the stored seal matching the content hash, if available."""
    seals_dir = _seals_dir(base_dir)
    for path in seals_dir.glob("*.json"):
        data = json.loads(path.read_text())
        if data.get("content_hash") == content_hash:
            return StoredSeal(
                content_hash=data["content_hash"],
                created_at=datetime.fromisoformat(data["created_at"]),
                salt=data["salt"],
                signature=data["signature"],
                storage_ref=data["storage_ref"],
            )
    return None
