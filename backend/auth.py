"""Single-admin JWT authentication. Secrets and password hashes are server-only."""
import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()
bearer = HTTPBearer(auto_error=False)
ALGORITHM = 'HS256'


def check_auth_config() -> None:
    required = ('JWT_SECRET_KEY', 'ADMIN_USERNAME', 'ADMIN_PASSWORD_HASH')
    missing = [name for name in required if not os.getenv(name)]
    if missing:
        raise RuntimeError(f"Missing auth configuration: {', '.join(missing)}")
    if not os.environ['ADMIN_PASSWORD_HASH'].startswith('$argon2'):
        raise RuntimeError('ADMIN_PASSWORD_HASH must be an Argon2 password hash')
    if len(os.environ['JWT_SECRET_KEY']) < 32:
        raise RuntimeError('JWT_SECRET_KEY must be at least 32 characters')


def authenticate(username: str, password: str) -> bool:
    expected = os.environ['ADMIN_USERNAME']
    # Verify a real Argon2 hash even if the username is incorrect.
    try:
        valid_password = password_hash.verify(password, os.environ['ADMIN_PASSWORD_HASH'])
    except Exception:
        raise RuntimeError('ADMIN_PASSWORD_HASH must contain a valid Argon2 hash')
    return valid_password and username == expected


def create_access_token(username: str) -> str:
    minutes = int(os.getenv('JWT_EXPIRE_MINUTES', '60'))
    if not 1 <= minutes <= 1440:
        raise RuntimeError('JWT_EXPIRE_MINUTES must be between 1 and 1440')
    now = datetime.now(timezone.utc)
    return jwt.encode({
        'sub': username,
        'iat': now,
        'exp': now + timedelta(minutes=minutes),
        'iss': 'portfolio-api',
    }, os.environ['JWT_SECRET_KEY'], algorithm=ALGORITHM)


def require_admin(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)) -> str:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Invalid or expired admin session',
        headers={'WWW-Authenticate': 'Bearer'},
    )
    if credentials is None or credentials.scheme.lower() != 'bearer':
        raise unauthorized
    try:
        payload = jwt.decode(
            credentials.credentials,
            os.environ['JWT_SECRET_KEY'],
            algorithms=[ALGORITHM], issuer='portfolio-api',
            options={'require': ['sub', 'exp', 'iat', 'iss']},
        )
    except jwt.PyJWTError:
        raise unauthorized from None
    username = payload.get('sub')
    if username != os.environ['ADMIN_USERNAME']:
        raise unauthorized
    return username
