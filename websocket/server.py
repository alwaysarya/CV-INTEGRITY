import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
import json
from datetime import datetime
from pathlib import Path

try:
    from fastapi import FastAPI, WebSocket, WebSocketDisconnect
    from fastapi.middleware.cors import CORSMiddleware
    import uvicorn
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False
    print("⚠️ fastapi/uvicorn not installed!")
    print("   Run: pip install fastapi uvicorn websockets")


class ConnectionManager:
    def __init__(self):
        self.active_connections = []
    
    async def connect(self, websocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"✅ Client connected. Total: {len(self.active_connections)}")
    
    def disconnect(self, websocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        print(f"❌ Client disconnected. Total: {len(self.active_connections)}")
    
    async def send_personal(self, message: dict, websocket):
        try:
            await websocket.send_json(message)
        except:
            pass
    
    async def broadcast(self, message: dict):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)


manager = ConnectionManager()


if FASTAPI_AVAILABLE:
    app = FastAPI(title="CV-INTEGRITY WebSocket")
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    @app.get("/")
    async def root():
        return {
            "status": "running",
            "connections": len(manager.active_connections),
            "timestamp": datetime.now().isoformat()
        }
    
    @app.get("/health")
    async def health():
        return {"status": "healthy", "connections": len(manager.active_connections)}
    
    @app.post("/broadcast")
    async def broadcast_endpoint(message: dict):
        await manager.broadcast(message)
        return {"status": "sent", "clients": len(manager.active_connections)}
    
    @app.websocket("/ws")
    async def websocket_endpoint(websocket: WebSocket):
        await manager.connect(websocket)
        try:
            await manager.send_personal({
                "type": "welcome",
                "message": "Connected to CV-INTEGRITY WebSocket",
                "timestamp": datetime.now().isoformat()
            }, websocket)
            
            while True:
                data = await websocket.receive_text()
                try:
                    message = json.loads(data)
                    msg_type = message.get("type", "unknown")
                    
                    if msg_type == "ping":
                        await manager.send_personal({
                            "type": "pong",
                            "timestamp": datetime.now().isoformat()
                        }, websocket)
                    elif msg_type == "get_status":
                        await manager.send_personal({
                            "type": "status",
                            "data": get_system_status(),
                            "timestamp": datetime.now().isoformat()
                        }, websocket)
                    else:
                        await manager.broadcast(message)
                except json.JSONDecodeError:
                    await manager.send_personal({
                        "type": "error",
                        "message": "Invalid JSON"
                    }, websocket)
        except WebSocketDisconnect:
            manager.disconnect(websocket)
        except Exception as e:
            print(f"❌ Error: {e}")
            manager.disconnect(websocket)


def get_system_status():
    base = Path(__file__).parent.parent
    reports = base / "outputs" / "reports"
    models = base / "model" / "saved_models"
    datasets = base / "datasets" / "processed"
    return {
        "reports": len(list(reports.glob("*.json"))) if reports.exists() else 0,
        "models": len(list(models.glob("*"))) if models.exists() else 0,
        "datasets": len(list(datasets.glob("*"))) if datasets.exists() else 0,
        "connections": len(manager.active_connections),
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🔌 CV-INTEGRITY WebSocket Server")
    print("="*60)
    print(f"   WebSocket URL: ws://localhost:8765/ws")
    print(f"   HTTP URL: http://localhost:8765")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8765, log_level="info")