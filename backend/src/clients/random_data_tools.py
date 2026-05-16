from src.clients.base import HTTPClient


class RandomDataClient(HTTPClient):
    async def get_listperson(self, count: int) -> list[dict]:
        return await self.get(
            path="/",
            params={"count": count},
        )