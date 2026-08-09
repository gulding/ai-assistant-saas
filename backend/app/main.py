from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api.routes import meetings

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Secretary API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meetings.router, prefix="/api")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "AI Secretary API is online"}
