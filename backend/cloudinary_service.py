"""Cloudinary adapters. The returned public_id includes the folder prefix."""
import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET'),
    secure=True,
)


def upload_image(file_content: bytes, public_id: str, folder: str) -> dict:
    result = cloudinary.uploader.upload(
        file_content, public_id=public_id, folder=folder,
        resource_type='image', overwrite=False, format='webp',
    )
    return {'public_id': result['public_id'], 'url': result['secure_url']}


def delete_image(public_id: str) -> None:
    response = cloudinary.uploader.destroy(public_id, resource_type='image', invalidate=True)
    if response.get('result') not in ('ok', 'not found'):
        raise RuntimeError(f'Cloudinary delete returned {response.get("result", "unknown")}')


def get_image_url(public_id: str) -> str:
    return cloudinary.CloudinaryImage(public_id).build_url(secure=True)

# Legacy aliases, should not be used for image deletion.
def upload_file(file_content: bytes, public_id: str, folder: str) -> dict:
    response = cloudinary.uploader.upload(file_content, public_id=public_id, folder=folder, resource_type='raw')
    return {'public_id': response['public_id'], 'url': response['secure_url']}


def delete_file(public_id: str) -> None:
    response = cloudinary.uploader.destroy(public_id, resource_type='raw', invalidate=True)
    if response.get('result') not in ('ok', 'not found'):
        raise RuntimeError('Cloudinary raw file deletion failed')
