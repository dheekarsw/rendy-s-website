from pydantic import BaseModel, ConfigDict, Field


class ExperiencePayload(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        extra="ignore",
    )

    company: str = Field(min_length=1)
    short_company: str = Field(
        default="",
        alias="shortCompany",
    )

    role: str = Field(min_length=1)
    location: str = ""
    period: str = Field(min_length=1)
    type: str = ""

    description: str = Field(min_length=1)

    mark: str = ""
    color: str = "forest"

    logo_url: str | None = Field(
        default=None,
        alias="logoUrl",
    )

    logo_public_id: str | None = Field(
        default=None,
        alias="logoPublicId",
    )