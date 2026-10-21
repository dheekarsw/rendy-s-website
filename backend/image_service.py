from io import BytesIO
from PIL import Image, ImageOps, UnidentifiedImageError
from fastapi import HTTPException, UploadFile

ALLOWED_TYPES = {'image/jpeg', 'image/png', 'image/webp'}
MAX_IMAGE_BYTES = 10 * 1024 * 1024


def compress_image(content: bytes, max_width=1600, max_height=1600, quality=80) -> tuple[bytes, str]:
    try:
        with Image.open(BytesIO(content)) as original:
            original.verify()
        with Image.open(BytesIO(content)) as original:
            image = ImageOps.exif_transpose(original)
            # Preserve transparency in logos and snapshots.
            if image.mode in ('RGBA', 'LA') or 'transparency' in image.info:
                image = image.convert('RGBA')
            else:
                image = image.convert('RGB')
            image.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
            output = BytesIO()
            image.save(output, format='WEBP', quality=quality, method=6)
            return output.getvalue(), 'image/webp'
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError) as exc:
        raise HTTPException(status_code=400, detail='The selected file is not a valid image') from exc


async def read_image(file: UploadFile) -> bytes:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail='Only JPG, PNG and WebP files are supported')
    content = await file.read(MAX_IMAGE_BYTES + 1)
    if not content:
        raise HTTPException(status_code=400, detail='The image is empty')
    if len(content) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail='Maximum image file size is 10 MB')
    return content
