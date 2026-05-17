from collections.abc import AsyncIterator
from typing import Any

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from src.database import Base, get_session
from src.main import app
from src.people.models import Person


TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture()
async def test_session() -> AsyncIterator[AsyncSession]:
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    session_maker = async_sessionmaker(
        bind=engine,
        expire_on_commit=False,
    )

    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

    async with session_maker() as session:
        yield session

    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)

    await engine.dispose()


class FakeRandomDataClient:
    async def get_listperson(self, count: int) -> list[dict[str, Any]]:
        return [
            {
                "Gender": "Мужчина",
                "FirstName": f"Имя{i}",
                "LastName": f"Фамилия{i}",
                "Phone": f"+799900000{i}",
                "Email": f"user{i}@example.com",
                "Address": f"Город, улица {i}",
            }
            for i in range(count)
        ]


@pytest.fixture()
async def client(test_session: AsyncSession) -> AsyncIterator[AsyncClient]:
    async def override_get_session() -> AsyncIterator[AsyncSession]:
        yield test_session

    app.dependency_overrides[get_session] = override_get_session
    app.state.rdt_client = FakeRandomDataClient()

    transport = ASGITransport(app=app)

    async with AsyncClient(
        transport=transport,
        base_url="http://test",
    ) as async_client:
        yield async_client

    app.dependency_overrides.clear()