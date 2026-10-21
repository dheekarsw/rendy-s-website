import re

from bson import ObjectId
from fastapi import HTTPException, UploadFile

from models import Project, ProjectSnapshotDocument

from schemas.project import ProjectPayload

from cloudinary_service import get_image_url

from media_service import upload_portfolio_image, cleanup_images, validate_image_id


IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp"
}

ALLOWED_FOLDERS = {
    "projects",
    "projects/snapshots"
}


# -------------------------
# Validation & helpers
# -------------------------

def normalize_slug(value: str) -> str:
    return re.sub(
        r"[^a-z0-9]+",
        "-",
        value.strip().lower()
    ).strip("-")


def optional_text(value: str | None) -> str | None:
    if value is None:
        return None

    value = value.strip()

    return value or None


async def find_project(
    identifier: str
) -> Project:

    project = None

    # Mendukung pencarian menggunakan MongoDB ObjectId.
    if ObjectId.is_valid(identifier):
        project = await Project.get(
            ObjectId(identifier)
        )

    # Jika bukan ID yang ditemukan, coba berdasarkan slug.
    if project is None:
        project = await Project.find_one(
            Project.slug == identifier
        )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return project


def make_snapshots(
    snapshots
) -> list[ProjectSnapshotDocument]:

    return [
        ProjectSnapshotDocument(
            title=(
                snapshot.title.strip()
                or "Project snapshot"
            ),
            caption=snapshot.caption.strip(),
            image_url=optional_text(
                snapshot.image
            ),
            image_public_id=optional_text(
                snapshot.image_public_id
            )
        )
        for snapshot in snapshots
    ]


def collect_project_image_ids(
    project: Project
) -> set[str]:

    public_ids = set()

    if project.cover_public_id:
        public_ids.add(
            project.cover_public_id
        )

    for snapshot in project.snapshots:
        if snapshot.image_public_id:
            public_ids.add(
                snapshot.image_public_id
            )

    return public_ids


def collect_payload_image_ids(
    payload: ProjectPayload
) -> set[str]:

    public_ids = set()

    cover_id = optional_text(
        payload.cover_public_id
    )

    if cover_id:
        public_ids.add(cover_id)

    for snapshot in payload.snapshots:
        image_id = optional_text(
            snapshot.image_public_id
        )

        if image_id:
            public_ids.add(image_id)

    return public_ids


def validate_project_images(payload: ProjectPayload) -> None:
    validate_image_id(payload.cover_public_id, "projects")
    for snapshot in payload.snapshots:
        validate_image_id(snapshot.image_public_id, "projects/snapshots")


def serialize_project(
    project: Project
) -> dict:

    if project.cover_public_id:
        cover_image = get_image_url(
            project.cover_public_id
        )
    else:
        cover_image = project.cover_image_url or ""

    snapshots = []

    for snapshot in project.snapshots:

        if snapshot.image_public_id:
            image_url = get_image_url(
                snapshot.image_public_id
            )
        else:
            image_url = snapshot.image_url or ""

        snapshots.append({
            "title": snapshot.title,
            "caption": snapshot.caption,
            "image": image_url,
            "imagePublicId": (
                snapshot.image_public_id or ""
            )
        })

    return {
        "id": str(project.id),

        "title": project.title,
        "slug": project.slug,
        "category": project.category,
        "year": project.year,

        "shortDescription": (
            project.short_description
        ),
        "summary": project.summary,
        "description": project.description,

        "highlights": project.highlights,
        "stack": project.stack,

        "coverImage": cover_image,
        "coverPublicId": (
            project.cover_public_id or ""
        ),

        "projectUrl": project.project_url,
        "repositoryUrl": project.repository_url,

        "visual": project.visual,
        "accent": project.accent,
        "previewLabel": project.preview_label,

        "snapshots": snapshots
    }


# -------------------------
# Image upload
# -------------------------

async def upload_project_image(file: UploadFile, folder: str = "projects"):
    if folder not in ALLOWED_FOLDERS:
        raise HTTPException(status_code=400, detail="Invalid project image folder")
    return await upload_portfolio_image(file, folder)


# -------------------------
# Create project
# -------------------------

async def create_project(
    payload: ProjectPayload
):

    slug = normalize_slug(
        payload.slug or payload.title
    )

    if not slug:
        raise HTTPException(
            status_code=400,
            detail="Project slug is required"
        )

    existing = await Project.find_one(
        Project.slug == slug
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Project slug already exists"
        )

    validate_project_images(payload)

    project = Project(
        title=payload.title.strip(),
        slug=slug,
        category=payload.category.strip(),
        year=payload.year.strip(),

        short_description=(
            payload.short_description
        ),
        summary=payload.summary,
        description=payload.description,

        highlights=[
            item.strip()
            for item in payload.highlights
            if item.strip()
        ],

        stack=[
            item.strip()
            for item in payload.stack
            if item.strip()
        ],

        cover_image_url=optional_text(
            payload.cover_image
        ),
        cover_public_id=optional_text(
            payload.cover_public_id
        ),

        project_url=optional_text(
            payload.project_url
        ),
        repository_url=optional_text(
            payload.repository_url
        ),

        visual=payload.visual,
        accent=payload.accent,
        preview_label=payload.preview_label,

        snapshots=make_snapshots(
            payload.snapshots
        )
    )

    try:
        await project.insert()

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create project: {str(e)}"
        )

    return {
        "message": "Project created successfully",
        "data": serialize_project(project)
    }


# -------------------------
# Get all projects
# -------------------------

async def get_projects():

    projects = await Project.find_all().to_list()

    return {
        "data": [
            serialize_project(project)
            for project in projects
        ]
    }


# -------------------------
# Get one project by ID or slug
# -------------------------

async def get_project(
    identifier: str
):

    project = await find_project(
        identifier
    )

    return {
        "data": serialize_project(project)
    }


# -------------------------
# Update project
# -------------------------

async def update_project(
    identifier: str,
    payload: ProjectPayload
):

    project = await find_project(
        identifier
    )

    slug = normalize_slug(
        payload.slug or payload.title
    )

    if not slug:
        raise HTTPException(
            status_code=400,
            detail="Project slug is required"
        )

    duplicate = await Project.find_one(
        Project.slug == slug
    )

    if duplicate and duplicate.id != project.id:
        raise HTTPException(
            status_code=409,
            detail="Project slug already exists"
        )

    validate_project_images(payload)

    # Simpan ID gambar sebelumnya agar dapat dihapus
    # setelah perubahan database berhasil.
    old_public_ids = collect_project_image_ids(
        project
    )

    project.title = payload.title.strip()
    project.slug = slug
    project.category = payload.category.strip()
    project.year = payload.year.strip()

    project.short_description = (
        payload.short_description
    )
    project.summary = payload.summary
    project.description = payload.description

    project.highlights = [
        item.strip()
        for item in payload.highlights
        if item.strip()
    ]

    project.stack = [
        item.strip()
        for item in payload.stack
        if item.strip()
    ]

    project.cover_image_url = optional_text(
        payload.cover_image
    )

    project.cover_public_id = optional_text(
        payload.cover_public_id
    )

    project.project_url = optional_text(
        payload.project_url
    )

    project.repository_url = optional_text(
        payload.repository_url
    )

    project.visual = payload.visual
    project.accent = payload.accent
    project.preview_label = payload.preview_label

    project.snapshots = make_snapshots(
        payload.snapshots
    )

    try:
        await project.save()

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update project: {str(e)}"
        )

    # Hapus hanya aset lama yang sudah tidak dipakai
    # oleh cover maupun snapshot yang baru.
    new_public_ids = collect_payload_image_ids(
        payload
    )

    removed_public_ids = (
        old_public_ids - new_public_ids
    )

    warnings = await cleanup_images(removed_public_ids)

    return {
        "message": "Project updated successfully",
        "data": serialize_project(project),
        "cleanupWarnings": warnings
    }


# -------------------------
# Delete project
# -------------------------

async def delete_project(
    identifier: str
):

    project = await find_project(
        identifier
    )

    public_ids = collect_project_image_ids(
        project
    )

    try:
        await project.delete()

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete project: {str(e)}"
        )

    # Hapus gambar hanya sesudah dokumen berhasil dihapus.
    warnings = await cleanup_images(public_ids)

    return {
        "message": "Project deleted successfully",
        "cleanupWarnings": warnings
    }