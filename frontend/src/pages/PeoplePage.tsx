import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getPeople, loadPeople } from "../api/people";
import type { Person } from "../types/people";

const LIMIT = 20;

function getPageNumbers(currentPage: number, totalPages: number) {
  const pages: number[] = [];

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  for (let page = startPage; page <= endPage; page += 1) {
    pages.push(page);
  }

  return pages;
}

export function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [count, setCount] = useState(100);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPeople, setIsLoadingPeople] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchPeople(currentOffset = offset) {
    setIsLoadingPeople(true);
    setError(null);

    try {
      const data = await getPeople({
        limit: LIMIT,
        offset: currentOffset,
      });

      setPeople(data.items);
      setTotal(data.total);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Произошла ошибка при загрузке данных",
      );
    } finally {
      setIsLoadingPeople(false);
    }
  }

  async function handleLoadPeople() {
    setIsLoading(true);
    setError(null);

    try {
      await loadPeople(count);

      setOffset(0);
      await fetchPeople(0);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Произошла ошибка при загрузке людей",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function goToPage(page: number) {
    setOffset((page - 1) * LIMIT);
  }

  useEffect(() => {
    fetchPeople();
  }, [offset]);

  const currentPage = Math.floor(offset / LIMIT) + 1;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">
              Yadro Random Users Service
            </h1>

            <p className="mt-2 text-slate-600">
              Загрузка случайных людей из внешнего API и просмотр данных из
              базы.
            </p>
          </div>

          <Link
            to="/random"
            className="rounded-xl bg-white px-5 py-2 text-center font-medium text-slate-900 shadow-sm hover:bg-slate-50"
          >
            Случайный человек
          </Link>
        </header>

        <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm md:flex-row md:items-end">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">
              Количество людей для загрузки
            </span>

            <input
              type="number"
              min={1}
              max={1000}
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-slate-700 md:w-72"
            />
          </label>

          <button
            type="button"
            onClick={handleLoadPeople}
            disabled={isLoading}
            className="rounded-xl bg-slate-900 px-5 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Загрузка..." : "Загрузить"}
          </button>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Пол</th>
                  <th className="px-4 py-3 font-semibold">Имя</th>
                  <th className="px-4 py-3 font-semibold">Фамилия</th>
                  <th className="px-4 py-3 font-semibold">Телефон</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Место проживания</th>
                  <th className="px-4 py-3 font-semibold">Подробнее</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {people.map((person) => (
                  <tr key={person.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">{person.gender ?? "—"}</td>
                    <td className="px-4 py-3">{person.first_name ?? "—"}</td>
                    <td className="px-4 py-3">{person.last_name ?? "—"}</td>
                    <td className="px-4 py-3">{person.phone ?? "—"}</td>
                    <td className="px-4 py-3">{person.email ?? "—"}</td>
                    <td className="max-w-md px-4 py-3">
                      {person.address ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/people/${person.id}`}
                        className="font-medium text-slate-900 underline underline-offset-4"
                      >
                        Открыть
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!isLoadingPeople && people.length === 0 && (
              <div className="p-6 text-center text-slate-500">
                Люди не найдены
              </div>
            )}

            {isLoadingPeople && (
              <div className="p-6 text-center text-slate-500">
                Загрузка...
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600">
            Страница {currentPage} из {totalPages}. Всего записей: {total}
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={currentPage === 1 || isLoadingPeople}
              onClick={() => goToPage(currentPage - 1)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              Назад
            </button>

            {currentPage > 3 && (
              <>
                <button
                  type="button"
                  disabled={isLoadingPeople}
                  onClick={() => goToPage(1)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium"
                >
                  1
                </button>

                <span className="px-2 py-2 text-sm text-slate-500">...</span>
              </>
            )}

            {pageNumbers.map((page) => (
              <button
                key={page}
                type="button"
                disabled={isLoadingPeople}
                onClick={() => goToPage(page)}
                className={
                  page === currentPage
                    ? "rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                    : "rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                }
              >
                {page}
              </button>
            ))}

            {currentPage < totalPages - 2 && (
              <>
                <span className="px-2 py-2 text-sm text-slate-500">...</span>

                <button
                  type="button"
                  disabled={isLoadingPeople}
                  onClick={() => goToPage(totalPages)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium"
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              type="button"
              disabled={currentPage === totalPages || isLoadingPeople}
              onClick={() => goToPage(currentPage + 1)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              Вперёд
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}