# 📋 CV-INTEGRITY AI — Assurance Report Schema

**Version:** 1.0.0  
**Problem Statement:** SIH 2026 — 26228

---

## 🎯 Overview

The Assurance Report is the primary output of the CV-INTEGRITY AI framework. It provides evidence-based assessment of integrity and risk across training data, models, and inference records.

Every finding includes:
- Human-readable reason
- Supporting evidence (hashes, signatures)
- Confidence / severity level
- Affected asset identifier
- Recommended disposition (ACCEPT / REVIEW / QUARANTINE)

---

## 📐 Root Schema

```json
{
  "report_id": "string (UUID)",
  "schema_version": "1.0.0",
  "generated_at": "ISO 8601 timestamp",
  "pipeline_id": "string",
  "contributors": ["array of contributor IDs"],
  "summary": {
    "total_findings": "integer",
    "critical": "integer",
    "high": "integer",
    "medium": "integer",
    "low": "integer",
    "overall_decision": "ACCEPT | REVIEW | QUARANTINE"
  },
  "findings": [
    {
      "finding_id": "string",
      "category": "DATA | MODEL | INFERENCE | DRIFT",
      "severity": "CRITICAL | HIGH | MEDIUM | LOW",
      "confidence": "float (0.0 - 1.0)",
      "affected_asset": {
        "asset_type": "dataset | model | inference",
        "asset_id": "string",
        "asset_hash": "SHA-256"
      },
      "reason": "human-readable string",
      "evidence": {
        "detection_method": "string",
        "reference_hash": "SHA-256",
        "observed_hash": "SHA-256"
      },
      "recommended_disposition": "ACCEPT | REVIEW | QUARANTINE"
    }
  ],
  "coverage_statement": {
    "supported_attack_classes": ["array"],
    "assumptions": ["array"],
    "limitations": ["array"]
  },
  "audit_trail": {
    "blockchain_reference": "block hash",
    "signature": "RSA-2048 signature"
  }
}
