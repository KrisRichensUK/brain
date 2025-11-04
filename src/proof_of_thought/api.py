"""FastAPI application exposing the Proof of Thought endpoints."""
from __future__ import annotations

from fastapi import FastAPI, HTTPException

from .models import ProofRequest, ProofResponse, SealRequest, SealResponse, VerifyRequest, VerifyResponse
from .service import SealNotFoundError, create_proof, seal_idea, verify_proof

app = FastAPI(
    title="Proof of Thought",
    description="Hash, timestamp, and verify creative ideas without revealing them.",
    version="0.1.0",
)


@app.post("/seal", response_model=SealResponse)
def seal_endpoint(request: SealRequest) -> SealResponse:
    return seal_idea(request)


@app.post("/prove", response_model=ProofResponse)
def prove_endpoint(request: ProofRequest) -> ProofResponse:
    try:
        return create_proof(request)
    except SealNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post("/verify", response_model=VerifyResponse)
def verify_endpoint(request: VerifyRequest) -> VerifyResponse:
    return verify_proof(request)
