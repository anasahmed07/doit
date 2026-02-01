import uvicorn

def development() -> None:
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, log_level="debug", reload=True)

    
def production() -> None:
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, log_level="info")
