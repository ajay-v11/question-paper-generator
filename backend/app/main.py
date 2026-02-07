from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, subjects, documents, papers, rag, generation

app = FastAPI(title="Jenisha Question Paper Generator")

# Configure CORS
origins = [
    "http://localhost:5173",  # Vite default port
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(subjects.router, prefix="/api", tags=["subjects"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(papers.router, prefix="/api/papers", tags=["papers"])
app.include_router(rag.router, prefix="/api/rag", tags=["rag"])
app.include_router(generation.router, prefix="/api/generation", tags=["generation"])


@app.get("/")
def read_root():
    return {"message": "Welcome to Jenisha API"}
