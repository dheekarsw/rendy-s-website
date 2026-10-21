"""Upload images and reliably clean up replaced/deleted media.

Failed Cloudinary deletion is queued in MongoDB for manual retry; deletion
is never attempted for an image still referenced by an active document.
"""
import logging
import uuid
from fastapi import HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool
from models import Profile, Experience, Project, PendingImageDeletion
from cloudinary_service import delete_image, upload_image
from image_service import read_image, compress_image

log = logging.getLogger(__name__)
ALLOWED_FOLDERS = {'profiles', 'experiences', 'projects', 'projects/snapshots'}


def validate_image_id(public_id: str | None, folder: str | None = None) -> str | None:
    if not public_id:
        return None
    if not isinstance(public_id, str) or len(public_id) > 300 or '..' in public_id:
        raise HTTPException(status_code=422, detail='Invalid Cloudinary public ID')
    if folder and not public_id.startswith(folder + '/'):
        raise HTTPException(status_code=422, detail=f'Expected an image uploaded in {folder}')
    if not any(public_id.startswith(candidate + '/') for candidate in ALLOWED_FOLDERS):
        raise HTTPException(status_code=422, detail='Image is not in a portfolio folder')
    return public_id


async def upload_portfolio_image(file: UploadFile, folder: str) -> dict:
    if folder not in ALLOWED_FOLDERS:
        raise HTTPException(status_code=400, detail='Unsupported image folder')
    content = await read_image(file)
    optimized, _ = await run_in_threadpool(compress_image, content)
    public_id = uuid.uuid4().hex
    try:
        result = await run_in_threadpool(upload_image, optimized, public_id, folder)
    except Exception as exc:
        log.exception('Image upload failed')
        raise HTTPException(status_code=502, detail='Cloudinary image upload failed; check backend logs and credentials') from exc
    return {'url': result['url'], 'publicId': result['public_id']}


async def image_is_referenced(public_id: str) -> bool:
    if await Profile.find_one(Profile.photo_public_id == public_id):
        return True
    if await Experience.find_one(Experience.logo_public_id == public_id):
        return True
    if await Project.find_one(Project.cover_public_id == public_id):
        return True
    # Snapshot arrays are nested documents; Mongo dot notation is supported here.
    if await Project.find_one({'snapshots.image_public_id': public_id}):
        return True
    return False


async def cleanup_images(ids: set[str]) -> list[str]:
    """Returns public IDs whose deletion failed (queued for retry)."""
    failed = []
    for public_id in ids:
        if not public_id or await image_is_referenced(public_id):
            continue
        try:
            await run_in_threadpool(delete_image, public_id)
            for entry in await PendingImageDeletion.find(PendingImageDeletion.public_id == public_id).to_list():
                await entry.delete()
        except Exception as exc:
            log.exception('Cloudinary deletion failed for %s', public_id)
            failed.append(public_id)
            if not await PendingImageDeletion.find_one(PendingImageDeletion.public_id == public_id):
                await PendingImageDeletion(public_id=public_id, error=str(exc)[:500]).insert()
    return failed


async def delete_unreferenced_image(public_id: str) -> dict:
    validate_image_id(public_id)
    if await image_is_referenced(public_id):
        raise HTTPException(status_code=409, detail='This image is still used. Save the changed entry before deleting it.')
    failed = await cleanup_images({public_id})
    if failed:
        raise HTTPException(status_code=502, detail='Image deletion failed and was queued for retry')
    return {'message': 'Image removed'}


async def retry_pending_deletions() -> dict:
    pending = await PendingImageDeletion.find_all().to_list()
    failed = await cleanup_images({entry.public_id for entry in pending})
    remaining = await PendingImageDeletion.find_all().count()
    return {'retried': len(pending), 'remaining': remaining, 'failedPublicIds': failed}
