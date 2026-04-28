from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status


BACKEND_DIR = Path(__file__).resolve().parents[2]
UPLOADS_DIR = BACKEND_DIR / "uploads"
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024


def ensure_upload_dir(folder: str) -> Path:
    upload_dir = UPLOADS_DIR / folder
    upload_dir.mkdir(parents=True, exist_ok=True)
    return upload_dir


async def save_upload_file(
    upload: UploadFile,
    folder: str,
    allowed_extensions: set[str],
) -> str:
    if not upload.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must have a filename",
        )

    suffix = Path(upload.filename).suffix.lower()
    if suffix not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type",
        )

    content = await upload.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must not exceed 5MB",
        )

    upload_dir = ensure_upload_dir(folder)
    filename = f"{uuid4().hex}{suffix}"
    file_path = upload_dir / filename
    file_path.write_bytes(content)
    return f"/uploads/{folder}/{filename}"


def delete_upload_file(file_url: str | None) -> None:
    if not file_url or not file_url.startswith("/uploads/"):
        return

    relative_path = file_url.removeprefix("/uploads/")
    file_path = UPLOADS_DIR / relative_path
    if file_path.exists():
        file_path.unlink()
