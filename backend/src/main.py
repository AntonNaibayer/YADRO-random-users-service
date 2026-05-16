from contextlib import asynccontextmanager
import random

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, func

# from src.database import SessionDep, Base, setup_database
from src.config import settings
from src.database import new_session, setup_database, SessionDep
from src.clients.random_data_tools import RandomDataClient
from src.people.models import Person
from src.people.router import people_router
from src.people.schemas import PersonResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    rdt_client = RandomDataClient(
        base_url=settings.BASE_URL
    )

    #создаём клиент именно в момент запуска сервера(а не на моменте импортов)
    await rdt_client.start()
    app.state.rdt_client = rdt_client


    await setup_database()
    #получаем данные о 1000 пользователях в момент запуска (условие ТЗ)\
    data = await rdt_client.get_listperson(1000)

    people = [
        Person.from_external_api(person) for person in data
    ]
    
    #сохраняем в бд
    async with new_session() as session:
        session.add_all(people)
        await session.commit()
    

    try:
        ...
        yield
    finally:
        # не забываем закрыть после остановки сервера
        await rdt_client.close()

    


app = FastAPI(
    title="Yadro Random Users Service",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(people_router)

@app.get(
    "/random",
    response_model=PersonResponse,
)
async def get_random_person(session: SessionDep):
    people_count = await session.scalar(
        select(func.count(Person.id))
    )

    if not people_count:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="В базе данных пока нет людей",
        )

    random_offset = random.randint(0, people_count - 1)

    result = await session.execute(
        select(Person)
        .offset(random_offset)
        .limit(1)
    )

    person = result.scalar_one()
    return person