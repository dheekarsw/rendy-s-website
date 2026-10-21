from pydantic import BaseModel, ConfigDict, Field, EmailStr, field_validator
from urllib.parse import urlsplit
from schemas.socials import SocialLink


class ProfilePayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True, str_strip_whitespace=True)
    name: str = Field(min_length=1)
    brand: str = Field(min_length=1)
    role: str = ''
    location: str = ''
    greeting: str = ''
    intro: str = ''
    about_label: str = Field('', alias='aboutLabel')
    about_title: str = Field('', alias='aboutTitle')
    about_text: str = Field('', alias='aboutText')
    about_tags: list[str] = Field(default_factory=list, alias='aboutTags')
    email: EmailStr
    photo: str | None = None
    photo_public_id: str | None = Field(None, alias='photoPublicId')
    socials: list[SocialLink] = Field(default_factory=list)

    @field_validator('photo', 'photo_public_id', mode='before')
    @classmethod
    def empty_none(cls, value):
        return value or None

    @field_validator('photo')
    @classmethod
    def check_image_url(cls, value):
        if value is not None:
            url = urlsplit(value)
            if not ((url.scheme == 'https' and url.netloc) or (value.startswith('/') and not value.startswith('//'))):
                raise ValueError('Photo URL must be HTTPS or a local /public asset path')
        return value
