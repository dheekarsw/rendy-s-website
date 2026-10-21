from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    UploadFile
)

from auth import require_admin

from schemas.project import ProjectPayload

from services.project_service import (
    upload_project_image,
    create_project,
    get_projects,
    get_project,
    update_project,
    delete_project
)


router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)


@router.post("/upload-image", dependencies=[Depends(require_admin)])
async def upload_project_image_endpoint(
    file: UploadFile = File(...),
    folder: str = Form("projects")
):
    return await upload_project_image(
        file=file,
        folder=folder
    )


@router.post("", dependencies=[Depends(require_admin)])
async def create_project_endpoint(
    payload: ProjectPayload
):
    return await create_project(
        payload
    )


@router.get("")
async def get_projects_endpoint():
    return await get_projects()


@router.get("/{identifier}")
async def get_project_endpoint(
    identifier: str
):
    return await get_project(
        identifier
    )


@router.put("/{identifier}", dependencies=[Depends(require_admin)])
async def update_project_endpoint(
    identifier: str,
    payload: ProjectPayload
):
    return await update_project(
        identifier,
        payload
    )


@router.delete("/{identifier}", dependencies=[Depends(require_admin)])
async def delete_project_endpoint(
    identifier: str
):
    return await delete_project(
        identifier
    )