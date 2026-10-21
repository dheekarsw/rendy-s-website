from bson import ObjectId
from fastapi import HTTPException
from pydantic import ValidationError
from models import Profile
from schemas.profile import ProfilePayload
from cloudinary_service import get_image_url
from media_service import cleanup_images, validate_image_id

PRIMARY_PROFILE_ID = ObjectId('000000000000000000000001')


async def primary_profile() -> Profile | None:
    current = await Profile.get(PRIMARY_PROFILE_ID)
    if current:
        return current
    legacy = await Profile.find_all().to_list()
    return min(legacy, key=lambda p: str(p.id)) if legacy else None


def serialize_profile(profile: Profile) -> dict:
    photo = get_image_url(profile.photo_public_id) if profile.photo_public_id else (profile.photo_url or '')
    return {
        'id': str(profile.id), 'name': profile.name, 'brand': profile.brand,
        'role': profile.role, 'location': profile.location, 'greeting': profile.greeting,
        'intro': profile.intro, 'aboutLabel': profile.about_label,
        'aboutTitle': profile.about_title, 'aboutText': profile.about_text,
        'aboutTags': profile.about_tags, 'email': profile.email,
        'photo_url': photo, 'photoPublicId': profile.photo_public_id or '',
        'socials': [s.model_dump(by_alias=True) for s in profile.socials],
    }


def assign_profile(profile: Profile, payload: ProfilePayload):
    validate_image_id(payload.photo_public_id, 'profiles')
    ids = [link.id for link in payload.socials]
    if len(ids) != len(set(ids)):
        raise HTTPException(status_code=422, detail='Social IDs must be unique')
    profile.name = payload.name
    profile.brand = payload.brand
    profile.role = payload.role
    profile.location = payload.location
    profile.greeting = payload.greeting
    profile.intro = payload.intro
    profile.about_label = payload.about_label
    profile.about_title = payload.about_title
    profile.about_text = payload.about_text
    profile.about_tags = list(dict.fromkeys(tag.strip() for tag in payload.about_tags if tag.strip()))
    profile.email = payload.email
    profile.photo_public_id = payload.photo_public_id
    profile.photo_url = None if payload.photo_public_id else payload.photo
    profile.socials = payload.socials


async def create_profile(payload: ProfilePayload):
    if await primary_profile():
        raise HTTPException(status_code=409, detail='Only one profile is allowed. Update the existing profile.')
    profile = Profile(
        id=PRIMARY_PROFILE_ID, name=payload.name, brand=payload.brand,
        role='', location='', greeting='', intro='', about_label='',
        about_title='', about_text='', email=payload.email,
    )
    assign_profile(profile, payload)
    try:
        await profile.insert()
    except Exception as exc:
        if await primary_profile():
            raise HTTPException(status_code=409, detail='Profile already exists') from exc
        raise
    return {'data': serialize_profile(profile)}


async def get_profiles():
    profile = await primary_profile()
    return {'data': [serialize_profile(profile)] if profile else []}


async def get_profile(profile_id: str):
    profile = await require_profile(profile_id)
    return {'data': serialize_profile(profile)}


async def require_profile(profile_id: str) -> Profile:
    current = await primary_profile()
    if current is None or str(current.id) != profile_id:
        raise HTTPException(status_code=404, detail='Primary profile not found')
    return current


async def update_profile(profile_id: str, payload: ProfilePayload):
    profile = await require_profile(profile_id)
    old_id = profile.photo_public_id
    assign_profile(profile, payload)
    await profile.save()
    failed = await cleanup_images({old_id} if old_id and old_id != profile.photo_public_id else set())
    return {'data': serialize_profile(profile), 'cleanupWarnings': failed}


async def delete_profile(profile_id: str):
    profile = await require_profile(profile_id)
    if len(await Profile.find_all().to_list()) > 1:
        raise HTTPException(status_code=409, detail='Remove legacy duplicate profiles before deleting primary')
    old_id = profile.photo_public_id
    await profile.delete()
    failed = await cleanup_images({old_id} if old_id else set())
    return {'message': 'Profile deleted', 'cleanupWarnings': failed}
