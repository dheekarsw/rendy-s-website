from fastapi import APIRouter, Depends
from auth import require_admin
from schemas.profile import ProfilePayload
from services.profile_service import create_profile, get_profiles, get_profile, update_profile, delete_profile

router = APIRouter(prefix='/profiles', tags=['Profiles'])


@router.get('')
async def list_profiles():
    return await get_profiles()


@router.get('/{profile_id}')
async def one_profile(profile_id: str):
    return await get_profile(profile_id)


@router.post('', dependencies=[Depends(require_admin)])
async def new_profile(payload: ProfilePayload):
    return await create_profile(payload)


@router.put('/{profile_id}', dependencies=[Depends(require_admin)])
async def edit_profile(profile_id: str, payload: ProfilePayload):
    return await update_profile(profile_id, payload)


@router.delete('/{profile_id}', dependencies=[Depends(require_admin)])
async def remove_profile(profile_id: str):
    return await delete_profile(profile_id)
