from fastapi import FastAPI
from database import engine, Base
import models
from routers import problems

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(problems.router)

@app.get("/")
def root():
    return {"message": "CodePrep API is running"}