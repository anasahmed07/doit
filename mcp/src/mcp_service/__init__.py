import uvicorn

def development() -> None:
    uvicorn.run("mcp_service.main:app", host="127.0.0.1", port=8080, log_level="debug", reload=True)

    
def production() -> None:
    uvicorn.run("mcp_service.main:app", host="0.0.0.0", port=8080, log_level="info")
