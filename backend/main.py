from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import problems, behavioral

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "https://codeprep-app.onrender.com", "https://codeprep-lyart.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(problems.router)
app.include_router(behavioral.router)

@app.get("/")
def root():
    return {"message": "CodePrep API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}