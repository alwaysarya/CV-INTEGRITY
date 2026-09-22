"""
Source-Level Risk Aggregation
Aggregates sample-level evidence into contributor/source-level risk assessment.

SIH Requirement 2.2.1: "aggregate sample-level evidence into a source-level risk assessment"
"""

import json
import numpy as np
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
from collections import defaultdict


class SourceRiskAggregator:
    """
    Aggregate sample-level risk into contributor/source-level risk.
    
    Risk Factors:
    - Anomaly rate
    - Label inconsistency
    - Trigger suspicion
    - Duplicate rate
    - OOD score
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
        })
    
    def add_sample(self, source_id: str, sample_id: str, 
                   is_anomaly: bool = False,
                   is_duplicate: bool = False,
                   has_label_issue: bool = False,
                   has_trigger: bool = False,
                   is_ood: bool = False,
                   risk_score: float = 0.0):
        """Add a sample with its risk indicators."""
        src = self.sources[source_id]
        src["samples"].append({
            "sample_id": sample_id,
            "risk_score": risk_score,
            "flags": {
                "anomaly": is_anomaly,
                "duplicate": is_duplicate,
                "label_issue": has_label_issue,
                "trigger": has_trigger,
                "ood": is_ood,
            }
        })
        src["total"] += 1
        if is_anomaly: src["anomalies"] += 1
        if is_duplicate: src["duplicates"] += 1
        if has_label_issue: src["label_issues"] += 1
        if has_trigger: src["trigger_suspicion"] += 1
        if is_ood: src["ood_samples"] += 1
    
    def compute_source_risk(self, source_id: str) -> Dict[str, Any]:
        """Compute aggregated risk for a single source."""
        src = self.sources.get(source_id)
        if not src or src["total"] == 0:
            return {
                "source_id": source_id,
                "status": "no_data",
                "risk_score": 0.0,
                "risk_level": "UNKNOWN",
            }
        
        total = src["total"]
        
        # Compute rates
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
        
        # Risk level
        if risk_score < 20:
            risk_level = "LOW"
        elif risk_score < 40:
            risk_level = "MEDIUM"
        elif risk_score < 60:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"
        
        # Recommended action
        if risk_score < 20:
            action = "ACCEPT"
        elif risk_score < 40:
            action = "REVIEW"
        elif risk_score < 60:
            action = "QUARANTINE"
        else:
            action = "REJECT"
        
        return {
            "source_id": source_id,
            "total_samples": total,
            "risk_score": round(risk_score, 2),
            "risk_level": risk_level,
            "action": action,
            "rates": {
                "anomaly_rate": round(anomaly_rate * 100, 2),
                "duplicate_rate": round(duplicate_rate * 100, 2),
                "label_issue_rate": round(label_issue_rate * 100, 2),
                "trigger_rate": round(trigger_rate * 100, 2),
                "ood_rate": round(ood_rate * 100, 2),
            },
            "counts": {
                "anomalies": src["anomalies"],
                "duplicates": src["duplicates"],
                "label_issues": src["label_issues"],
                "triggers": src["trigger_suspicion"],
                "ood": src["ood_samples"],
            },
            "evidence": [
                f"{src['anomalies']} anomalous samples detected",
                f"{src['duplicates']} duplicate samples found",
                f"{src['label_issues']} label inconsistencies",
                f"{src['trigger_suspicion']} potential trigger samples",
                f"{src['ood_samples']} out-of-distribution samples",
            ],
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    def compute_all_sources(self) -> List[Dict[str, Any]]:
        """Compute risk for all sources."""
        return [self.compute_source_risk(sid) for sid in self.sources.keys()]
    
    def get_top_risk_sources(self, n: int = 5) -> List[Dict[str, Any]]:
        """Get top N highest-risk sources."""
        all_risks = self.compute_all_sources()
        return sorted(all_risks, key=lambda x: x.get("risk_score", 0), reverse=True)[:n]
    
    def generate_report(self) -> Dict[str, Any]:
        """Generate full source-level risk report."""
        all_risks = self.compute_all_sources()
        
        if not all_risks:
            return {
                "status": "no_data",
                "total_sources": 0,
                "sources": [],
            }
        
        # Sort by risk score
        all_risks.sort(key=lambda x: x.get("risk_score", 0), reverse=True)
        
        # Summary
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
    """
    High-level function to aggregate contributor risk.
    
    Input: List of dicts like:
    [
        {"source_id": "contrib_1", "sample_id": "img_001", "is_anomaly": True, ...},
        ...
    ]
    """
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
        )
    
    return aggregator.generate_report()


if __name__ == "__main__":
    # Test
    test_data = [
        {"source_id": "contrib_1", "sample_id": "img_001", "is_anomaly": True},
        {"source_id": "contrib_1", "sample_id": "img_002", "is_anomaly": True},
        {"source_id": "contrib_1", "sample_id": "img_003", "has_trigger": True},
        {"source_id": "contrib_2", "sample_id": "img_004"},
        {"source_id": "contrib_2", "sample_id": "img_005"},
    ]
    report = aggregate_contributor_risk(test_data)
    print(json.dumps(report, indent=2))
