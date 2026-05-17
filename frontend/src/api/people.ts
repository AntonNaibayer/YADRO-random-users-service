import type {
  LoadPeopleResponse,
  PaginatedPeopleResponse,
  Person,
} from "../types/people";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export async function getPeople(params: {
  limit: number;
  offset: number;
}): Promise<PaginatedPeopleResponse> {
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });

  const response = await fetch(`${API_URL}/people?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error("Не удалось загрузить список людей");
  }

  return response.json();
}

export async function loadPeople(count: number): Promise<LoadPeopleResponse> {
  const searchParams = new URLSearchParams({
    count: String(count),
  });

  const response = await fetch(
    `${API_URL}/people/load?${searchParams.toString()}`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error("Не удалось загрузить людей из внешнего API");
  }

  return response.json();
}

export async function getPerson(personId: number): Promise<Person> {
  const response = await fetch(`${API_URL}/people/${personId}`);

  if (!response.ok) {
    throw new Error("Человек не найден");
  }

  return response.json();
}

export async function getRandomPerson(): Promise<Person> {
  const response = await fetch(`${API_URL}/random`);

  if (!response.ok) {
    throw new Error("Не удалось загрузить случайного человека");
  }

  return response.json();
}