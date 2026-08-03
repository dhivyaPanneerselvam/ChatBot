from fastapi import APIRouter
from pydantic import BaseModel

from services.ingest_service import ingest_website

router = APIRouter()


class Website(BaseModel):
    url: str


@router.post("/ingest")
def ingest(data: Website):

    result = ingest_website(data.url)

    if result is None:
        return {
            "error": "Unable to crawl website"
        }

    return result