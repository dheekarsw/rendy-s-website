from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from auth import authenticate, create_access_token, require_admin

router = APIRouter(prefix='/auth', tags=['Authentication'])


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post('/login')
async def login(payload: LoginRequest):
    if not authenticate(payload.username, payload.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid username or password')
    return {'access_token': create_access_token(payload.username), 'token_type': 'bearer'}


@router.get('/me')
async def me(username: str = Depends(require_admin)):
    return {'username': username}
