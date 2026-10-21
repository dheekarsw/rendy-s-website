from urllib.parse import urlsplit

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)


class SocialLink(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        extra="ignore",
    )

    id: str = Field(min_length=1, max_length=80)
    label: str = Field(min_length=1, max_length=100)
    url: str = ""
    handle: str = ""
    enabled: bool = True

    # Frontend menggunakan camelCase: customId.
    # Backend menggunakan snake_case: custom_id.
    custom_id: bool = Field(
        default=False,
        alias="customId",
    )

    @field_validator("id", "label", "url", "handle")
    @classmethod
    def trim_strings(cls, value: str) -> str:
        return value.strip()

    @field_validator("url")
    @classmethod
    def validate_url(cls, value: str) -> str:
        if not value:
            return value

        parsed = urlsplit(value)

        if (
            parsed.scheme not in {"http", "https"}
            or not parsed.netloc
        ):
            raise ValueError(
                "Social profile URL must start with http:// or https://"
            )

        return value