"""Configuration helpers for the Proof of Thought service."""
from __future__ import annotations

import os
from pathlib import Path
from typing import Optional


DEFAULT_DATA_DIR_NAME = "data"
DEFAULT_SECRET = "local-dev-secret"


def data_dir() -> Path:
    """Return the configured data directory path."""
    return Path(os.getenv("POT_DATA_DIR", DEFAULT_DATA_DIR_NAME))


def secret_key() -> str:
    """Return the signing secret key."""
    return os.getenv("POT_SECRET_KEY", DEFAULT_SECRET)


def ensure_data_dir(path: Optional[Path] = None) -> Path:
    """Ensure the storage directory exists and return it."""
    target = Path(path) if path is not None else data_dir()
    target.mkdir(parents=True, exist_ok=True)
    return target
