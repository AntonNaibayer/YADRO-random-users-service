import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getRandomPerson } from "../api/people";
import type { Person } from "../types/people";

export function RandomPersonPage() {
  const [person, setPerson] = useState<Person | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchRandomPerson() {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getRandomPerson();
      setPerson(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Произошла ошибка при загрузке случайного человека",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchRandomPerson();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
        <Link to="/" className="text-sm text-slate-600 underline">
          ← Назад к списку
        </Link>

        <div className="mt-4 flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-950">
            Случайный человек
          </h1>

          <button
            type="button"
            onClick={fetchRandomPerson}
            disabled={isLoading}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isLoading ? "Загрузка..." : "Обновить"}
          </button>
        </div>

        {error && <p className="mt-6 text-red-700">{error}</p>}

        {!error && !person && <p className="mt-6">Загрузка...</p>}

        {person && (
          <div className="mt-6 grid gap-3 text-sm">
            <p>
              <span className="font-semibold">ID:</span> {person.id}
            </p>
            <p>
              <span className="font-semibold">Имя:</span>{" "}
              {person.first_name ?? "—"}
            </p>
            <p>
              <span className="font-semibold">Фамилия:</span>{" "}
              {person.last_name ?? "—"}
            </p>
            <p>
              <span className="font-semibold">Пол:</span>{" "}
              {person.gender ?? "—"}
            </p>
            <p>
              <span className="font-semibold">Телефон:</span>{" "}
              {person.phone ?? "—"}
            </p>
            <p>
              <span className="font-semibold">Email:</span>{" "}
              {person.email ?? "—"}
            </p>
            <p>
              <span className="font-semibold">Адрес:</span>{" "}
              {person.address ?? "—"}
            </p>

            <Link
              to={`/people/${person.id}`}
              className="mt-4 inline-block font-medium underline underline-offset-4"
            >
              Открыть полную страницу человека
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}