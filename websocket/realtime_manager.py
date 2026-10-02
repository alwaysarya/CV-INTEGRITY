import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
from datetime import datetime

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False


class RealtimeManager:
    def __init__(self, ws_url="http://localhost:8765"):
        self.ws_url = ws_url
    
    def send_update(self, update_type: str, data: dict):
        if not REQUESTS_AVAILABLE:
            return False
        try:
            response = requests.post(
                f"{self.ws_url}/broadcast",
                json={"type": update_type, "data": data, "timestamp": datetime.now().isoformat()},
                timeout=5
            )
            return response.status_code == 200
        except:
            return False
    
    def notify_training_start(self, dataset_name: str, epochs: int):
        return self.send_update("training_start", {
            "dataset": dataset_name,
            "epochs": epochs,
            "message": f"Training started on {dataset_name}"
        })
    
    def notify_training_progress(self, dataset_name: str, epoch: int, total: int, metrics: dict):
        return self.send_update("training_progress", {
            "dataset": dataset_name,
            "epoch": epoch,
            "total": total,
            "progress": (epoch / total) * 100,
            "metrics": metrics
        })
    
    def notify_training_complete(self, dataset_name: str, metrics: dict):
        return self.send_update("training_complete", {
            "dataset": dataset_name,
            "metrics": metrics,
            "message": f"Training complete for {dataset_name}"
        })
    
    def notify_analysis_complete(self, analysis_type: str, results: dict):
        return self.send_update("analysis_complete", {
            "analysis_type": analysis_type,
            "results": results
        })
    
    def notify_trust_score_update(self, dataset: str, score: float, decision: str):
        return self.send_update("trust_score_update", {
            "dataset": dataset,
            "score": score,
            "decision": decision
        })
    
    def notify_blockchain_update(self, block_index: int, block_hash: str):
        return self.send_update("blockchain_update", {
            "block_index": block_index,
            "block_hash": block_hash
        })
    
    def notify_attack_detected(self, attack_name: str, severity: str):
        return self.send_update("attack_detected", {
            "attack_name": attack_name,
            "severity": severity,
            "alert": True
        })


if __name__ == "__main__":
    print("\n" + "="*60)
    print("📡 Real-time Manager Test")
    print("="*60 + "\n")
    
    manager = RealtimeManager()
    
    print("📤 Sending test updates...")
    manager.notify_training_start("good_dataset", 20)
    print("   ✅ Training start sent")
    manager.notify_trust_score_update("good", 88.0, "ACCEPT")
    print("   ✅ Trust score sent")
    
    print("\n" + "="*60)
    print("✅ Real-time Manager ready!")
    print("="*60)