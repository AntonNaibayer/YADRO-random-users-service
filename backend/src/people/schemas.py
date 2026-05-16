from typing import Any

from pydantic import BaseModel, ConfigDict

class PersonResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int

    gender: str | None
    first_name: str | None
    last_name: str | None
    phone: str | None
    email: str | None
    address: str | None

    raw_data: dict[str, Any]

class LoadPeopleResponse(BaseModel):
    loaded: int