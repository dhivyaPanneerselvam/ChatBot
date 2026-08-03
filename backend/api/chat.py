from fastapi import APIRouter
from pydantic import BaseModel

from services.agent_service import AgentService

router = APIRouter()

agent = AgentService()


class ChatRequest(BaseModel):
    website: str
    question: str


@router.post("/chat")
def chat(request: ChatRequest):

    return agent.chat(
        question=request.question,
        website=request.website
    )