import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getPerson } from "../api/people";
import type { Person } from "../types/people";

export function PersonDetailPage() {
  const { personId } = useParams();

  const [person, setPerson] = useState<Person | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPerson() {
      if (!personId) {
        setError("ID человека не указан");
        return;
      }

      try {
        const data = await getPerson(Number(personId));
        setPerson(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Произошла ошибка при загрузке человека",
        );
      }
    }

    fetchPerson();
  }, [personId]);

  if (error) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-8">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-red-700">{error}</p>

          <Link to="/" className="mt-4 inline-block underline">
            Вернуться к списку
          </Link>
        </div>
      </main>
    );
  }

  if (!person) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-8">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
          Загрузка...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
        <Link to="/" className="text-sm text-slate-600 underline">
          ← Назад к списку
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-slate-950">
          {person.first_name ?? "—"} {person.last_name ?? ""}
        </h1>

        <div className="mt-6 grid gap-3 text-sm">
          <p>
            <span className="font-semibold">ID:</span> {person.id}
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
        </div>

        <details className="mt-6">
          <summary className="cursor-pointer font-medium">
            Полные данные из API
          </summary>

          <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-100 p-4 text-xs">
            {JSON.stringify(person.raw_data, null, 2)}
          </pre>
        </details>
      </div>
    </main>
  );
}