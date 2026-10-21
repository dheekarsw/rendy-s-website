from fastapi import APIRouter, Depends, File, Form, UploadFile
from pydantic import BaseModel
from auth import require_admin
from media_service import upload_portfolio_image, delete_unreferenced_image, retry_pending_deletions

router = APIRouter(prefix='/media', tags=['Media'], dependencies=[Depends(require_admin)])


class DeleteImageRequest(BaseModel):
    publicId: str


@router.post('/upload-image')
async def upload_image_endpoint(file: UploadFile = File(...), folder: str = Form('projects')):
    return await upload_portfolio_image(file, folder)


@router.post('/delete-image')
async def delete_image_endpoint(payload: DeleteImageRequest):
    return await delete_unreferenced_image(payload.publicId)


@router.post('/retry-deletions')
async def retry_deletions_endpoint():
    return await retry_pending_deletions()
