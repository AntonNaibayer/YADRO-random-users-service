from typing import Any

from aiohttp import ClientSession


class HTTPClient:
    def __init__(self, base_url: str) -> None:
        self._base_url = base_url
        self._session: ClientSession | None = None

    async def start(self) -> None:
        self._session = ClientSession(base_url=self._base_url)

    async def close(self) -> None:
        if self._session is not None:
            await self._session.close()

    def _get_session(self) -> ClientSession:
        if self._session is None:
            raise RuntimeError("HTTP client session is not initialized")

        return self._session

    async def get(self, path: str, params: dict[str, Any] | None = None) -> Any:
        session = self._get_session()

        async with session.get(path, params=params) as response:
            response.raise_for_status()
            return await response.json(content_type=None)