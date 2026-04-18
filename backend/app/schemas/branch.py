import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class BranchBase(BaseModel):
    name: str
    location: str
    city: str


class BranchCreate(BranchBase):
    pass


class BranchUpdate(BaseModel):
    name: str | None = None
    location: str | None = None
    city: str | None = None


class BranchResponse(BranchBase):
    id: uuid.UUID
    coach_id: uuid.UUID
    name: str
    location: str
    city: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
