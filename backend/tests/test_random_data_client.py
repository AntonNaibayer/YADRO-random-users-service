from typing import Any

import pytest

from src.clients.base import HTTPClient
from src.clients.random_data_tools import RandomDataClient


def test_http_client_get_session_raises_if_not_started() -> None:
    client = HTTPClient(base_url="https://example.com")

    with pytest.raises(RuntimeError, match="HTTP client session is not initialized"):
        client._get_session()


async def test_random_data_client_get_listperson_uses_base_get(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    client = RandomDataClient(base_url="https://api.randomdatatools.ru")

    async def fake_get(
        path: str,
        params: dict[str, Any] | None = None,
    ) -> list[dict[str, Any]]:
        assert path == "/"
        assert params == {"count": 2}

        return [
            {
                "FirstName": "Иван",
                "LastName": "Иванов",
            },
            {
                "FirstName": "Пётр",
                "LastName": "Петров",
            },
        ]

    monkeypatch.setattr(client, "get", fake_get)

    result = await client.get_listperson(2)

    assert len(result) == 2
    assert result[0]["FirstName"] == "Иван"
    assert result[1]["LastName"] == "Петров"