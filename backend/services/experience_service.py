from bson import ObjectId
from fastapi import HTTPException

from models import Experience
from schemas.experience import ExperiencePayload

from cloudinary_service import get_image_url
from media_service import cleanup_images, validate_image_id


def validate_object_id(experience_id: str) -> ObjectId:
    try:
        return ObjectId(experience_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid experience ID",
        )


def serialize_experience(experience: Experience) -> dict:
    logo_url = experience.logo_url

    # Jika logo berasal dari Cloudinary, buat URL berdasarkan public ID.
    if experience.logo_public_id:
        try:
            logo_url = get_image_url(
                experience.logo_public_id
            )
        except Exception:
            # Pertahankan URL tersimpan jika pembuatan URL gagal.
            pass

    return {
        "id": str(experience.id),
        "company": experience.company,
        "shortCompany": experience.short_company,
        "role": experience.role,
        "location": experience.location,
        "period": experience.period,
        "type": experience.type,
        "description": experience.description,
        "mark": experience.mark,
        "color": experience.color,
        "logoUrl": logo_url,
        "logoPublicId": experience.logo_public_id,
    }


def payload_to_dict(payload: ExperiencePayload) -> dict:
    data = payload.model_dump()

    # Simpan field logo yang kosong sebagai None.
    data["logo_url"] = data.get("logo_url") or None
    data["logo_public_id"] = (
        data.get("logo_public_id") or None
    )

    validate_image_id(data["logo_public_id"], "experiences")
    return data


async def create_experience(
    payload: ExperiencePayload,
):
    try:
        experience = Experience(
            **payload_to_dict(payload)
        )

        await experience.insert()

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create experience: {str(e)}",
        )

    return {
        "message": "Experience created successfully",
        "data": serialize_experience(experience),
    }


async def get_experiences():
    experiences = await Experience.find_all().to_list()

    return {
        "data": [
            serialize_experience(experience)
            for experience in experiences
        ]
    }


async def get_experience(experience_id: str):
    object_id = validate_object_id(experience_id)

    experience = await Experience.get(object_id)

    if experience is None:
        raise HTTPException(
            status_code=404,
            detail="Experience not found",
        )

    return {
        "data": serialize_experience(experience),
    }


async def update_experience(
    experience_id: str,
    payload: ExperiencePayload,
):
    object_id = validate_object_id(experience_id)

    experience = await Experience.get(object_id)

    if experience is None:
        raise HTTPException(
            status_code=404,
            detail="Experience not found",
        )

    data = payload_to_dict(payload)

    old_logo_public_id = experience.logo_public_id
    new_logo_public_id = data["logo_public_id"]

    # Perbarui seluruh field yang dikirim frontend.
    for field, value in data.items():
        setattr(experience, field, value)

    try:
        await experience.save()

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update experience: {str(e)}",
        )

    # Only delete after MongoDB commit; failures are queued for retry.
    warnings = await cleanup_images({old_logo_public_id} if old_logo_public_id and old_logo_public_id != new_logo_public_id else set())

    return {
        "message": "Experience updated successfully",
        "data": serialize_experience(experience),
        "cleanupWarnings": warnings,
    }


async def delete_experience(experience_id: str):
    object_id = validate_object_id(experience_id)

    experience = await Experience.get(object_id)

    if experience is None:
        raise HTTPException(
            status_code=404,
            detail="Experience not found",
        )

    old_id = experience.logo_public_id
    await experience.delete()
    warnings = await cleanup_images({old_id} if old_id else set())

    return {
        "message": "Experience deleted successfully",
        "cleanupWarnings": warnings,
    }