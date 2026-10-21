"""Offline image-processing regression tests. Run: pytest -q"""
from io import BytesIO
import pytest
from PIL import Image
from fastapi import HTTPException, UploadFile
from starlette.datastructures import Headers
from image_service import compress_image, read_image


def test_png_alpha_survives_conversion():
    raw = BytesIO()
    Image.new('RGBA', (2000, 600), (20, 30, 40, 0)).save(raw, 'PNG')
    optimized, mime = compress_image(raw.getvalue())
    with Image.open(BytesIO(optimized)) as image:
        assert mime == 'image/webp'
        assert image.format == 'WEBP'
        assert image.width == 1600
        assert image.mode == 'RGBA'
        assert image.getpixel((0, 0))[3] == 0


def test_invalid_image_is_rejected():
    with pytest.raises(HTTPException) as exc:
        compress_image(b'not an image')
    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_reject_large_file():
    file = UploadFile(file=BytesIO(b'X' * (10 * 1024 * 1024 + 1)), filename='test.png', headers=Headers({'content-type': 'image/png'}))
    with pytest.raises(HTTPException) as exc:
        await read_image(file)
    assert exc.value.status_code == 413
