#!/usr/bin/env bash
set -euo pipefail

curl -X POST "$AFFIX_BASE_URL/api/eligibility/check" \
  -H "Authorization: Bearer $AFFIX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"user_123","dataSources":{"membership":{"valid":true},"payment":{"status":"paid"},"blacklist":{"blocked":false}},"rules":{"name":"venue_entry","conditions":[{"field":"membership.valid","operator":"eq","value":true}]}}'
