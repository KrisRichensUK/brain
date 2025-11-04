from __future__ import annotations

import importlib
import json
import os
import sys
from pathlib import Path

import pytest

from proof_of_thought import models


MODULES_TO_RELOAD = [
    "proof_of_thought.config",
    "proof_of_thought.crypto",
    "proof_of_thought.storage",
    "proof_of_thought.service",
]


def reload_modules(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("POT_DATA_DIR", str(tmp_path))
    monkeypatch.setenv("POT_SECRET_KEY", "unit-test-secret")
    for module in MODULES_TO_RELOAD:
        if module in sys.modules:
            del sys.modules[module]
    config = importlib.import_module("proof_of_thought.config")
    importlib.reload(config)
    crypto = importlib.import_module("proof_of_thought.crypto")
    importlib.reload(crypto)
    storage = importlib.import_module("proof_of_thought.storage")
    importlib.reload(storage)
    service = importlib.import_module("proof_of_thought.service")
    importlib.reload(service)
    return service


def test_seal_creates_persisted_record(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    service = reload_modules(tmp_path, monkeypatch)
    request = models.SealRequest(text="my secret idea")
    response = service.seal_idea(request)

    assert response.content_hash
    assert response.signature
    assert response.storage_ref

    record_path = Path(os.environ["POT_DATA_DIR"]) / response.storage_ref
    assert record_path.exists()

    payload = json.loads(record_path.read_text())
    assert payload["content_hash"] == response.content_hash
    assert payload["signature"] == response.signature


def test_proof_round_trip(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    service = reload_modules(tmp_path, monkeypatch)
    seal_response = service.seal_idea(models.SealRequest(text="another idea"))

    proof_response = service.create_proof(models.ProofRequest(content_hash=seal_response.content_hash))
    assert proof_response.content_hash == seal_response.content_hash

    verify_response = service.verify_proof(
        models.VerifyRequest(content_hash=seal_response.content_hash, proof=proof_response.proof)
    )
    assert verify_response.valid is True
    assert "matches" in verify_response.detail
