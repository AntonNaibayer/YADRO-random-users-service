from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from src.people.models import Person


async def create_person(
    session: AsyncSession,
    first_name: str = "Иван",
    last_name: str = "Иванов",
) -> Person:
    person = Person(
        gender="Мужчина",
        first_name=first_name,
        last_name=last_name,
        phone="+79991234567",
        email=f"{first_name.lower()}@example.com",
        address="Москва",
        raw_data={
            "Gender": "Мужчина",
            "FirstName": first_name,
            "LastName": last_name,
            "Phone": "+79991234567",
            "Email": f"{first_name.lower()}@example.com",
            "Address": "Москва",
        },
    )

    session.add(person)
    await session.commit()
    await session.refresh(person)

    return person


async def test_get_people_list_returns_paginated_response(
    client: AsyncClient,
    test_session: AsyncSession,
) -> None:
    await create_person(test_session, first_name="Иван")
    await create_person(test_session, first_name="Пётр")

    response = await client.get(
        "/people/",
        params={
            "limit": 1,
            "offset": 0,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 2
    assert data["limit"] == 1
    assert data["offset"] == 0
    assert len(data["items"]) == 1


async def test_get_people_list_respects_offset(
    client: AsyncClient,
    test_session: AsyncSession,
) -> None:
    await create_person(test_session, first_name="Первый")
    await create_person(test_session, first_name="Второй")

    response = await client.get(
        "/people/",
        params={
            "limit": 1,
            "offset": 1,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 2
    assert data["limit"] == 1
    assert data["offset"] == 1
    assert len(data["items"]) == 1


async def test_get_person_by_id_returns_person(
    client: AsyncClient,
    test_session: AsyncSession,
) -> None:
    person = await create_person(test_session, first_name="Антон")

    response = await client.get(f"/people/{person.id}")

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == person.id
    assert data["first_name"] == "Антон"


async def test_get_person_by_id_returns_404_if_person_not_found(
    client: AsyncClient,
) -> None:
    response = await client.get("/people/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Человек с таким ID не найден"


async def test_load_people_saves_people_from_external_api(
    client: AsyncClient,
) -> None:
    response = await client.post(
        "/people/load",
        params={"count": 3},
    )

    assert response.status_code == 200
    assert response.json() == {"loaded": 3}

    list_response = await client.get(
        "/people/",
        params={
            "limit": 10,
            "offset": 0,
        },
    )

    assert list_response.status_code == 200

    data = list_response.json()

    assert data["total"] == 3
    assert len(data["items"]) == 3


async def test_random_person_returns_person(
    client: AsyncClient,
    test_session: AsyncSession,
) -> None:
    person = await create_person(test_session, first_name="Случайный")

    response = await client.get("/random")

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == person.id
    assert data["first_name"] == "Случайный"


async def test_random_person_returns_404_when_database_is_empty(
    client: AsyncClient,
) -> None:
    response = await client.get("/random")

    assert response.status_code == 404
    assert response.json()["detail"] == "В базе данных пока нет людей"

async def test_get_people_list_returns_422_for_invalid_limit(
    client: AsyncClient,
) -> None:
    response = await client.get(
        "/people/",
        params={
            "limit": 101,
            "offset": 0,
        },
    )

    assert response.status_code == 422


async def test_get_people_list_returns_422_for_negative_offset(
    client: AsyncClient,
) -> None:
    response = await client.get(
        "/people/",
        params={
            "limit": 10,
            "offset": -1,
        },
    )

    assert response.status_code == 422