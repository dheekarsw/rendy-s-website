from beanie import Document
from pydantic import Field, EmailStr, BaseModel
from typing import Optional
from schemas.socials import SocialLink


class Profile(Document):
    name: str
    brand: str
    role: str
    location: str
    greeting: str
    intro: str
    about_label: str
    about_title: str
    about_text: str
    about_tags: list[str] = Field(default_factory=list)
    email: EmailStr
    photo_public_id: Optional[str] = None
    photo_url: Optional[str] = None
    socials: list[SocialLink] = Field(default_factory=list)

    class Settings:
        name = 'profiles'


class Experience(Document):
    company: str
    short_company: str = ''
    role: str
    location: str = ''
    period: str
    type: str = ''
    description: str
    mark: str = ''
    color: str = 'forest'
    logo_url: str | None = None
    logo_public_id: str | None = None

    class Settings:
        name = 'experiences'


class ProjectSnapshotDocument(BaseModel):
    title: str = 'Project snapshot'
    caption: str = ''
    image_url: str | None = None
    image_public_id: str | None = None


class Project(Document):
    title: str = ''
    slug: str = ''
    category: str = ''
    year: str = ''
    short_description: str = ''
    summary: str = ''
    description: str = ''
    highlights: list[str] = Field(default_factory=list)
    stack: list[str] = Field(default_factory=list)
    cover_image_url: str | None = None
    cover_public_id: str | None = None
    project_url: str | None = None
    repository_url: str | None = None
    visual: str = 'vision'
    accent: str = '#c7e8d7'
    preview_label: str = 'Project preview'
    snapshots: list[ProjectSnapshotDocument] = Field(default_factory=list)

    class Settings:
        name = 'projects'


class PendingImageDeletion(Document):
    public_id: str
    error: str = ''

    class Settings:
        name = 'pending_image_deletions'
