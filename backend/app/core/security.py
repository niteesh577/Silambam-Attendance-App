import logging
import time
from typing import Any

import requests
from jose import JWTError, jwk, jwt
from jose.utils import base64url_decode

from app.core.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# JWKS cache — avoids hitting Clerk's endpoint on every request
# ---------------------------------------------------------------------------
_JWKS_CACHE: dict[str, Any] = {}
_JWKS_CACHE_TTL: int = 3600  # seconds (1 hour)
_JWKS_CACHE_FETCHED_AT: float = 0.0


def _fetch_jwks() -> dict[str, Any]:
    """Fetch JWKS from Clerk and return the raw JSON."""
    try:
        response = requests.get(settings.CLERK_JWKS_URL, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as exc:
        logger.error("Failed to fetch JWKS from Clerk: %s", exc)
        raise RuntimeError("Unable to fetch JWKS") from exc


def _get_jwks() -> dict[str, Any]:
    """Return cached JWKS, refreshing if the TTL has expired."""
    global _JWKS_CACHE, _JWKS_CACHE_FETCHED_AT

    now = time.monotonic()
    if not _JWKS_CACHE or (now - _JWKS_CACHE_FETCHED_AT) > _JWKS_CACHE_TTL:
        logger.info("Refreshing JWKS cache from Clerk")
        _JWKS_CACHE = _fetch_jwks()
        _JWKS_CACHE_FETCHED_AT = now

    return _JWKS_CACHE


def _get_rsa_key(header: dict[str, Any]) -> dict[str, Any] | None:
    """
    Find the matching RSA key in JWKS by `kid` (key ID).
    Returns the key dict or None if not found.
    """
    jwks = _get_jwks()
    kid = header.get("kid")

    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            return key

    return None


def verify_clerk_token(token: str) -> dict[str, Any]:
    """
    Verify a Clerk-issued JWT.

    Steps:
      1. Decode the header (unverified) to extract `kid`.
      2. Find the matching public key in JWKS.
      3. Verify signature + standard claims.
      4. Return the decoded payload.

    Raises:
      JWTError – for any validation failure (signature, expiry, etc.)
    """
    try:
        # --- Step 1: read header without verification ---
        unverified_header = jwt.get_unverified_header(token)
    except JWTError as exc:
        logger.warning("Malformed JWT header: %s", exc)
        raise

    # --- Step 2: locate the correct public key ---
    rsa_key = _get_rsa_key(unverified_header)

    if rsa_key is None:
        # Key not in cache — try one forced refresh in case Clerk rotated keys
        logger.info("kid not found in cache; forcing JWKS refresh")
        global _JWKS_CACHE_FETCHED_AT
        _JWKS_CACHE_FETCHED_AT = 0.0
        rsa_key = _get_rsa_key(unverified_header)

    if rsa_key is None:
        raise JWTError("Public key not found in JWKS for the given kid")

    # --- Step 3: verify & decode ---
    try:
        payload: dict[str, Any] = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            options={"verify_aud": False},  # Clerk JWTs don't set `aud`
        )
    except JWTError as exc:
        logger.warning("JWT verification failed: %s", exc)
        raise

    return payload
