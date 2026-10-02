"""
Source-Level Risk Aggregation — Real Implementation
Aggregates sample-level evidence into contributor/source-level risk.
"""

import numpy as np
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
from collections import defaultdict


class SourceRiskAggregator:
    """
    Real source-level risk aggregation.
    
    Aggregates:
    - Anomaly rates
    - Duplicate rates
    - Label inconsistency
    - Trigger suspicion
    - OOD scores
    - Statistical outliers
    """
    
    def __init__(self):
        self.sources = defaultdict(lambda: {
            "samples": [],
            "anomalies": 0,
            "duplicates": 0,
            "label_issues": 0,
            "trigger_suspicion": 0,
            "ood_samples": 0,
            "total": 0,
            "risk_scores": [],
        })
    
    def add_sample(self, source_id: str, sample_id: str,
                   is_anomaly: bool = False,
                   is_duplicate: bool = False,
                   has_label_issue: bool = False,
                   has_trigger: bool = False,
                   is_ood: bool = False,
                   risk_score: float = 0.0):
        """Add a sample with risk indicators."""
        src = self.sources[source_id]
        src["samples"].append({
            "sample_id": sample_id,
            "risk_score": risk_score,
        })
        src["total"] += 1
        if is_anomaly: src["anomalies"] += 1
        if is_duplicate: src["duplicates"] += 1
        if has_label_issue: src["label_issues"] += 1
        if has_trigger: src["trigger_suspicion"] += 1
        if is_ood: src["ood_samples"] += 1
        src["risk_scores"].append(risk_score)
    
    def compute_source_risk(self, source_id: str) -> Dict[str, Any]:
        """Compute aggregated risk for one source."""
        src = self.sources.get(source_id)
        if not src or src["total"] == 0:
            return {
                "source_id": source_id,
                "status": "no_data",
                "risk_score": 0.0,
                "risk_level": "UNKNOWN",
                "action": "REVIEW",
            }
        
        total = src["total"]
        
        # Rates
        anomaly_rate = src["anomalies"] / total
        duplicate_rate = src["duplicates"] / total
        label_issue_rate = src["label_issues"] / total
        trigger_rate = src["trigger_suspicion"] / total
        ood_rate = src["ood_samples"] / total
        
        # Weighted risk score (0-100)
        weights = {
            "anomaly": 25,
            "duplicate": 10,
            "label_issue": 20,
            "trigger": 30,
            "ood": 15,
        }
        
        risk_score = (
            anomaly_rate * weights["anomaly"] +
            duplicate_rate * weights["duplicate"] +
            label_issue_rate * weights["label_issue"] +
            trigger_rate * weights["trigger"] +
            ood_rate * weights["ood"]
        ) * 100
        
        # Bonus: consistent sample-level risk (only if in [0, 1] range)
        if src["risk_scores"]:
            sample_risks = [r for r in src["risk_scores"] if 0 <= r <= 1]
            if sample_risks:
                avg_sample_risk = np.mean(sample_risks) * 100
                risk_score = (risk_score + avg_sample_risk) / 2
        
        # Cap risk score at 100
        risk_score = min(risk_score, 100.0)
        
        # Risk level + Action
        if risk_score < 20:
            level = "LOW"
            action = "ACCEPT"
        elif risk_score < 40:
            level = "MEDIUM"
            action = "REVIEW"
        elif risk_score < 60:
            level = "HIGH"
            action = "QUARANTINE"
        else:
            level = "CRITICAL"
            action = "REJECT"
        
        # Evidence
        evidence = []
        if src["anomalies"] > 0:
            evidence.append(f"{src['anomalies']} anomalous samples ({anomaly_rate*100:.1f}%)")
        if src["duplicates"] > 0:
            evidence.append(f"{src['duplicates']} duplicate samples ({duplicate_rate*100:.1f}%)")
        if src["label_issues"] > 0:
            evidence.append(f"{src['label_issues']} label inconsistencies ({label_issue_rate*100:.1f}%)")
        if src["trigger_suspicion"] > 0:
            evidence.append(f"{src['trigger_suspicion']} potential triggers ({trigger_rate*100:.1f}%)")
        if src["ood_samples"] > 0:
            evidence.append(f"{src['ood_samples']} out-of-distribution samples ({ood_rate*100:.1f}%)")
        
        # Recommendation
        if action == "ACCEPT":
            recommendation = "Source is trustworthy."
        elif action == "REVIEW":
            recommendation = "Manual review recommended."
        elif action == "QUARANTINE":
            recommendation = "Multiple integrity issues detected."
        else:
            recommendation = "Strong evidence of compromise."
        
        return {
            "source_id": source_id,
            "total_samples": total,
            "risk_score": round(risk_score, 2),
            "risk_level": level,
            "action": action,
            "recommendation": recommendation,
            "rates": {
                "anomaly": round(anomaly_rate * 100, 2),
                "duplicate": round(duplicate_rate * 100, 2),
                "label_issue": round(label_issue_rate * 100, 2),
                "trigger": round(trigger_rate * 100, 2),
                "ood": round(ood_rate * 100, 2),
            },
            "counts": {
                "anomalies": src["anomalies"],
                "duplicates": src["duplicates"],
                "label_issues": src["label_issues"],
                "triggers": src["trigger_suspicion"],
                "ood": src["ood_samples"],
            },
            "evidence": evidence,
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    def compute_all_sources(self) -> List[Dict[str, Any]]:
        return [self.compute_source_risk(sid) for sid in self.sources.keys()]
    
    def get_top_risk_sources(self, n: int = 5) -> List[Dict[str, Any]]:
        all_risks = self.compute_all_sources()
        return sorted(all_risks, key=lambda x: x.get("risk_score", 0), reverse=True)[:n]
    
    def generate_report(self) -> Dict[str, Any]:
        all_risks = self.compute_all_sources()
        
        if not all_risks:
            return {"status": "no_data", "total_sources": 0, "sources": []}
        
        all_risks.sort(key=lambda x: x.get("risk_score", 0), reverse=True)
        
        summary = {
            "total_sources": len(all_risks),
            "critical": sum(1 for r in all_risks if r.get("risk_level") == "CRITICAL"),
            "high": sum(1 for r in all_risks if r.get("risk_level") == "HIGH"),
            "medium": sum(1 for r in all_risks if r.get("risk_level") == "MEDIUM"),
            "low": sum(1 for r in all_risks if r.get("risk_level") == "LOW"),
        }
        
        return {
            "status": "success",
            "summary": summary,
            "sources": all_risks,
            "timestamp": datetime.utcnow().isoformat(),
        }


def aggregate_contributor_risk(contributors_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """High-level aggregation function."""
    aggregator = SourceRiskAggregator()
    for item in contributors_data:
        aggregator.add_sample(
            source_id=item.get("source_id", "unknown"),
            sample_id=item.get("sample_id", ""),
            is_anomaly=item.get("is_anomaly", False),
            is_duplicate=item.get("is_duplicate", False),
            has_label_issue=item.get("has_label_issue", False),
            has_trigger=item.get("has_trigger", False),
            is_ood=item.get("is_ood", False),
            risk_score=item.get("risk_score", 0.0),
        )
    return aggregator.generate_report()


if __name__ == "__main__":
    # Test with dummy data
    test_data = [
        {"source_id": "contrib_1", "sample_id": "img_001", "is_anomaly": True},
        {"source_id": "contrib_1", "sample_id": "img_002", "is_anomaly": True},
        {"source_id": "contrib_1", "sample_id": "img_003", "has_trigger": True},
        {"source_id": "contrib_2", "sample_id": "img_004"},
        {"source_id": "contrib_2", "sample_id": "img_005"},
    ]
    report = aggregate_contributor_risk(test_data)
    print(json.dumps(report, indent=2, default=str))
