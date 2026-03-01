from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers.auth import router as auth_router
from app.routers.habits import router as habits_router
from app.routers.todos import router as todos_router

app = FastAPI(title="DailyTracker API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(todos_router, prefix="/todos", tags=["todos"])
app.include_router(habits_router, prefix="/habits", tags=["habits"])


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
