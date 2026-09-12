import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
import json
from datetime import datetime

try:
    import websockets
    WEBSOCKETS_AVAILABLE = True
except ImportError:
    WEBSOCKETS_AVAILABLE = False
    print("⚠️ websockets not installed!")


class WebSocketClient:
    def __init__(self, url="ws://localhost:8765/ws"):
        self.url = url
        self.websocket = None
        self.connected = False
        self.messages = []
        self.callbacks = {}
    
    async def connect(self):
        if not WEBSOCKETS_AVAILABLE:
            return False
        try:
            self.websocket = await websockets.connect(self.url)
            self.connected = True
            print(f"✅ Connected to {self.url}")
            return True
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            return False
    
    async def disconnect(self):
        if self.websocket:
            await self.websocket.close()
            self.connected = False
            print("❌ Disconnected")
    
    async def send(self, message: dict):
        if self.connected and self.websocket:
            await self.websocket.send(json.dumps(message))
    
    async def receive(self):
        if self.connected and self.websocket:
            try:
                data = await self.websocket.recv()
                message = json.loads(data)
                self.messages.append(message)
                return message
            except:
                return None
    
    async def ping(self):
        await self.send({"type": "ping"})
        return await self.receive()
    
    async def get_status(self):
        await self.send({"type": "get_status"})
        return await self.receive()
    
    def on(self, event_type: str, callback):
        if event_type not in self.callbacks:
            self.callbacks[event_type] = []
        self.callbacks[event_type].append(callback)
    
    async def listen(self):
        while self.connected:
            message = await self.receive()
            if message:
                msg_type = message.get("type")
                if msg_type in self.callbacks:
                    for callback in self.callbacks[msg_type]:
                        callback(message)
                print(f"📨 {msg_type}: {message}")


async def demo():
    print("\n" + "="*60)
    print("🔌 WebSocket Client Demo")
    print("="*60 + "\n")
    
    client = WebSocketClient()
    
    if await client.connect():
        print("📤 Sending ping...")
        pong = await client.ping()
        print(f"📥 Pong: {pong}")
        
        print("\n📤 Getting status...")
        status = await client.get_status()
        print(f"📥 Status: {status}")
        
        await client.disconnect()
    
    print("\n" + "="*60)
    print("✅ Demo complete!")
    print("="*60)


if __name__ == "__main__":
    asyncio.run(demo())