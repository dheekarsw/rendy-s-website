from fastapi import APIRouter, Depends

from auth import require_admin

from schemas.experience import ExperiencePayload

from services.experience_service import (
    create_experience as create_experience_service,
    get_experiences as get_experiences_service,
    get_experience as get_experience_service,
    update_experience as update_experience_service,
    delete_experience as delete_experience_service,
)


router = APIRouter(
    prefix="/experiences",
    tags=["Experiences"],
)


@router.post("", dependencies=[Depends(require_admin)])
async def create_experience_endpoint(
    payload: ExperiencePayload,
):
    return await create_experience_service(payload)


@router.get("")
async def get_experiences_endpoint():
    return await get_experiences_service()


@router.get("/{experience_id}")
async def get_experience_endpoint(
    experience_id: str,
):
    return await get_experience_service(experience_id)


@router.put("/{experience_id}", dependencies=[Depends(require_admin)])
async def update_experience_endpoint(
    experience_id: str,
    payload: ExperiencePayload,
):
    return await update_experience_service(
        experience_id,
        payload,
    )


@router.delete("/{experience_id}", dependencies=[Depends(require_admin)])
async def delete_experience_endpoint(
    experience_id: str,
):
    return await delete_experience_service(
        experience_id
    )