from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator
)


class ProjectSnapshotPayload(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        extra="ignore"
    )

    title: str = "Project snapshot"
    caption: str = ""

    image: str | None = None

    image_public_id: str | None = Field(
        default=None,
        alias="imagePublicId"
    )

    @field_validator(
        "image",
        "image_public_id",
        mode="before"
    )
    @classmethod
    def empty_string_to_none(cls, value):
        if isinstance(value, str) and not value.strip():
            return None

        return value


class ProjectPayload(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        extra="ignore",
        str_strip_whitespace=True
    )

    title: str
    slug: str
    category: str

    # Bisa berisi "2025", "Prototype", dan sebagainya.
    year: str = ""

    short_description: str = Field(
        alias="shortDescription"
    )

    summary: str = ""
    description: str

    highlights: list[str] = Field(
        default_factory=list
    )

    stack: list[str] = Field(
        default_factory=list
    )

    cover_image: str | None = Field(
        default=None,
        alias="coverImage"
    )

    cover_public_id: str | None = Field(
        default=None,
        alias="coverPublicId"
    )

    project_url: str | None = Field(
        default=None,
        alias="projectUrl"
    )

    repository_url: str | None = Field(
        default=None,
        alias="repositoryUrl"
    )

    visual: str = "vision"
    accent: str = "#c7e8d7"

    preview_label: str = Field(
        default="Project preview",
        alias="previewLabel"
    )

    snapshots: list[ProjectSnapshotPayload] = Field(
        default_factory=list
    )

    @field_validator(
        "cover_image",
        "cover_public_id",
        "project_url",
        "repository_url",
        mode="before"
    )
    @classmethod
    def empty_string_to_none(cls, value):
        if isinstance(value, str) and not value.strip():
            return None

        return value