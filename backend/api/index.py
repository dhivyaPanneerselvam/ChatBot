from fastapi import APIRouter
from pydantic import BaseModel
import traceback

from services.index_service import IndexService

router = APIRouter()

index_service = IndexService()


class WebsiteRequest(BaseModel):
    website: str


@router.post("/index")
def index(request: WebsiteRequest):

    try:
        return index_service.index_website(request.website)

    except Exception:
        print("\n" + "=" * 80)
        traceback.print_exc()
        print("=" * 80 + "\n")

        return {
            "error": "See terminal traceback"
        }