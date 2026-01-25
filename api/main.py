import os
import django

# Set the Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "devtrack.settings")

# Initialize Django
django.setup()

from fastapi import FastAPI
from api.users.routes import router as auth_router
from api.projects.routes import router as project_router
from api.tickets.routes import router as ticket_router
from fastapi.middleware.cors import CORSMiddleware
# from api.core.models import django

origins = [
    "http://localhost:5173",  # Vite React dev server
]

app = FastAPI(title="DevTrack API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite frontend
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(project_router)
app.include_router(ticket_router)

@app.get("/")
def health():
    return {
        "status": "DevTrack API"
    }