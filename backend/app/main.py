from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers.auth import router as auth_router
from app.routers.dashboard import router as dashboard_router
from app.routers.habits import router as habits_router
from app.routers.macros import router as macros_router
from app.routers.meals import foods_router, meals_router
from app.routers.todos import router as todos_router
from app.routers.weight import router as weight_router

app = FastAPI(title="DailyTracker API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
app.include_router(todos_router, prefix="/todos", tags=["todos"])
app.include_router(habits_router, prefix="/habits", tags=["habits"])
app.include_router(weight_router, prefix="/weight", tags=["weight"])
app.include_router(macros_router, prefix="/macros", tags=["macros"])
app.include_router(foods_router, prefix="/foods", tags=["foods"])
app.include_router(meals_router, prefix="/meals", tags=["meals"])


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
