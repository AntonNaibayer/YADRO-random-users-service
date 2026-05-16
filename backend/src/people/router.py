from typing import Annotated

from fastapi import APIRouter, HTTPException, status, Depends, Query, Request
from sqlalchemy import select, func

from src.database import SessionDep
from src.common.pagination import PaginationParams
from src.common.schemas import PaginatedResponse
from src.clients.random_data_tools import RandomDataClient
from src.people.models import Person
from src.people.schemas import PersonResponse, LoadPeopleResponse


people_router = APIRouter(prefix='/people', tags=['Работа с данными людей'])

@people_router.get(
        "/",
        response_model=PaginatedResponse[PersonResponse]
)
async def get_people_list(
    session: SessionDep,
    pagination: Annotated[PaginationParams, Depends()],
):  
    total = await session.scalar(
        select(func.count(Person.id))
    )

    query = (
        select(Person)
        .order_by(Person.id.desc())
        .limit(pagination.limit)
        .offset(pagination.offset)
    )

    result = await session.execute(query)

    people = result.scalars().all()

    return {
        "items": people,
        "total": total or 0,
        "limit": pagination.limit,
        "offset": pagination.offset,
    }

@people_router.post(
    "/load",
    response_model=LoadPeopleResponse,
)
async def load_people(
    request: Request,
    session: SessionDep,
    count: int = Query(default=100, ge=1, le=1000),
):
    client: RandomDataClient = request.app.state.rdt_client

    data = await client.get_listperson(count)

    people = [
        Person.from_external_api(person)
        for person in data
    ]

    session.add_all(people)
    await session.commit()

    return LoadPeopleResponse(loaded=len(people))

@people_router.get(
        "/{person_id}",
        response_model=PersonResponse
)
async def get_data_person(
    person_id: int, 
    session: SessionDep
):
    query = (
        select(Person)
        .where(Person.id == person_id)
    )

    result = await session.execute(query)

    existing_person = result.scalar_one_or_none()

    if existing_person is None:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND, 
            detail = "Человек с таким ID не найден"
        )
    
    return existing_person
