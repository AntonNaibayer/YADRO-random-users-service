from typing import Any

from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column

from src.database import Base


class Person(Base):
    __tablename__ = "people"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    gender: Mapped[str | None] = mapped_column()
    first_name: Mapped[str | None] = mapped_column()
    last_name: Mapped[str | None] = mapped_column()
    phone: Mapped[str | None] = mapped_column()
    email: Mapped[str | None] = mapped_column()
    address: Mapped[str | None] = mapped_column()

    raw_data: Mapped[dict[str, Any]] = mapped_column(JSON)

    @classmethod
    def from_external_api(cls, data: dict[str, Any]) -> "Person":
        return cls(
            gender=data.get("Gender"),
            first_name=data.get("FirstName"),
            last_name=data.get("LastName"),
            phone=data.get("Phone"),
            email=data.get("Email"),
            address=data.get("Address"),
            raw_data=data,
        )