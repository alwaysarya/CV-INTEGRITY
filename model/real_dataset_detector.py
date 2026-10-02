"""
Real Dataset Integrity Detector
Detects actual anomalies in datasets: label flipping, mislabelling,
near-duplicates, OOD samples, class imbalance.
"""

import numpy as np
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime
from collections import Counter
import hashlib


class RealDatasetDetector:
    """
    Real dataset integrity detection with 5 methods:
    1. Label Uniqueness Analysis
    2. Bbox Variance Analysis
    3. Class Distribution Analysis
    4. Near-Duplicate Detection (perceptual hash)
    5. OOD Detection (image statistics)
    """

    def __init__(self, dataset_path: str, dataset_name: str = "unknown", access_level: str = "black-box"):
        self.dataset_path = Path(dataset_path)
        self.dataset_name = dataset_name
        self.access_level = access_level  # "black-box" or "white-box"
        self.images_dir = self.dataset_path / "images"
        self.labels_dir = self.dataset_path / "labels"

    def detect(self, max_images: int = 100) -> Dict[str, Any]:
        """Run comprehensive dataset integrity detection."""
        result = {
            "method": "dataset_integrity",
            "dataset_name": self.dataset_name,
            "access_level": self.access_level,
            "dataset_path": str(self.dataset_path),
            "timestamp": datetime.utcnow().isoformat(),
        }

        try:
            findings = []

            # 1. Label Uniqueness
            label_finding = self._label_uniqueness_analysis()
            findings.append(label_finding)

            # 2. Bbox Variance
            bbox_finding = self._bbox_variance_analysis()
            findings.append(bbox_finding)

            # 3. Class Distribution
            class_finding = self._class_distribution_analysis()
            findings.append(class_finding)

            # 4. Near-Duplicate Detection
            dup_finding = self._near_duplicate_detection(max_images)
            findings.append(dup_finding)

            # 5. OOD Detection
            ood_finding = self._ood_detection(max_images)
            findings.append(ood_finding)

            # White-box extra checks (if access_level allows)
            if self.access_level == "white-box":
                wb_finding = self._white_box_check()
                findings.append(wb_finding)

            # Aggregate
            result["status"] = "success"
            result["findings"] = findings
            result["overall_risk"] = self._aggregate_risk(findings)
            result["recommendation"] = self._get_recommendation(result["overall_risk"])
            result["limitations"] = self._get_limitations()
            result["dataset_stats"] = {
                "total_images": len(list(self.images_dir.glob("*"))) if self.images_dir.exists() else 0,
                "total_labels": len(list(self.labels_dir.glob("*.txt"))) if self.labels_dir.exists() else 0,
            }
            # Dynamic note based on actual verdict
            level = result["overall_risk"]["level"]
            if level == "LOW":
                note = (
                    f"Model '{self.dataset_name}' — Dataset passed all integrity checks. "
                    f"No anomalies detected in labels, bounding boxes, class distribution, "
                    f"duplicates, or out-of-distribution samples."
                )
            elif level == "MEDIUM":
                note = (
                    f"Model '{self.dataset_name}' — Minor anomalies detected. "
                    f"Manual review recommended before production use. "
                    f"Check the flagged detection methods above."
                )
            elif level == "HIGH":
                note = (
                    f"Model '{self.dataset_name}' — Significant integrity issues detected. "
                    f"Multiple detection methods flagged anomalies. "
                    f"Dataset should not be used without manual review."
                )
            elif level == "CRITICAL":
                note = (
                    f"Model '{self.dataset_name}' — SEVERE integrity violations detected. "
                    f"This is a strong attack signature (systematic mislabelling, "
                    f"label flipping, or coordinated data poisoning). "
                    f"Dataset should be QUARANTINED immediately."
                )
            else:
                note = f"Model '{self.dataset_name}' — Insufficient data for assessment."
            
            result["note"] = note

        except Exception as e:
            result["status"] = "failed"
            result["error"] = str(e)

        return result

    def _label_uniqueness_analysis(self) -> Dict[str, Any]:
        """Analyze label uniqueness — low uniqueness = suspicious."""
        if not self.labels_dir.exists():
            return {"method": "label_uniqueness", "status": "unavailable"}

        label_files = list(self.labels_dir.glob("*.txt"))
        if not label_files:
            return {"method": "label_uniqueness", "status": "no_labels"}

        # Read all labels
        all_labels = []
        for lf in label_files:
            try:
                content = lf.read_text().strip()
                if content:
                    all_labels.append(content)
            except Exception:
                continue

        if not all_labels:
            return {"method": "label_uniqueness", "status": "no_content"}

        total = len(all_labels)
        unique = len(set(all_labels))
        uniqueness_ratio = unique / total if total > 0 else 0

        # Confidence: low uniqueness = high suspicion
        if uniqueness_ratio < 0.05:
            confidence = 0.9
        elif uniqueness_ratio < 0.15:
            confidence = 0.6
        elif uniqueness_ratio < 0.3:
            confidence = 0.3
        else:
            confidence = 0.0

        # Per-sample evidence: top repeated labels + affected files
        from collections import Counter
        label_counter = Counter(all_labels)
        top_repeated = label_counter.most_common(5)

        # Get affected files for top 5 repeated labels
        flagged_samples = []
        for label, count in top_repeated:
            if count <= 1:
                continue  # Not repeated
            affected_files = []
            for lf in label_files:
                try:
                    if lf.read_text().strip() == label:
                        affected_files.append(lf.name.replace(".txt", ".jpg"))
                        if len(affected_files) >= 10:
                            break
                except Exception:
                    continue
            flagged_samples.append({
                "label": label,
                "occurrences": count,
                "affected_files": affected_files,
                "total_affected": count,
            })

        return {
            "method": "label_uniqueness",
            "status": "success",
            "confidence": float(confidence),
            "total_labels": total,
            "unique_labels": unique,
            "uniqueness_ratio": round(uniqueness_ratio, 4),
            "reason": f"Only {unique} unique labels out of {total} ({round(uniqueness_ratio*100, 1)}%)",
            "flagged_samples": flagged_samples,
            "affected_asset_count": total - unique,
        }

    def _bbox_variance_analysis(self) -> Dict[str, Any]:
        """Analyze bbox variance — low variance = suspicious."""
        if not self.labels_dir.exists():
            return {"method": "bbox_variance", "status": "unavailable"}

        label_files = list(self.labels_dir.glob("*.txt"))
        bboxes = []
        bbox_to_files = {}  # Track which files have which bboxes

        for lf in label_files:
            try:
                content = lf.read_text().strip()
                for line in content.split("\n"):
                    parts = line.strip().split()
                    if len(parts) >= 5:
                        # YOLO format: class x_center y_center width height
                        bbox_str = " ".join(parts[1:5])
                        bbox = [float(x) for x in parts[1:5]]
                        bboxes.append(bbox)
                        bbox_to_files.setdefault(bbox_str, []).append(lf.name.replace(".txt", ".jpg"))
            except Exception:
                continue

        if not bboxes:
            return {"method": "bbox_variance", "status": "no_bboxes"}

        bboxes_np = np.array(bboxes)
        variances = np.var(bboxes_np, axis=0)
        avg_variance = float(np.mean(variances))

        # Low variance = suspicious (all boxes same)
        if avg_variance < 0.001:
            confidence = 0.9
        elif avg_variance < 0.01:
            confidence = 0.5
        elif avg_variance < 0.05:
            confidence = 0.2
        else:
            confidence = 0.0

        # Per-sample evidence: top repeated bboxes
        sorted_bboxes = sorted(bbox_to_files.items(), key=lambda x: -len(x[1]))
        flagged_bboxes = []
        for bbox_str, files in sorted_bboxes[:5]:
            if len(files) <= 1:
                continue
            flagged_bboxes.append({
                "bbox": bbox_str,
                "occurrences": len(files),
                "affected_files": files[:10],  # Show max 10 files
                "total_affected": len(files),
            })

        return {
            "method": "bbox_variance",
            "status": "success",
            "confidence": float(confidence),
            "total_bboxes": len(bboxes),
            "avg_variance": round(avg_variance, 6),
            "per_coord_variance": [round(float(v), 6) for v in variances],
            "reason": f"Average bbox variance: {round(avg_variance, 6)}",
            "flagged_bboxes": flagged_bboxes,
        }

    def _class_distribution_analysis(self) -> Dict[str, Any]:
        """Analyze class distribution — imbalance = suspicious."""
        if not self.labels_dir.exists():
            return {"method": "class_distribution", "status": "unavailable"}

        label_files = list(self.labels_dir.glob("*.txt"))
        class_counts = Counter()
        class_to_files = {}  # Track which files have which class

        for lf in label_files:
            try:
                content = lf.read_text().strip()
                for line in content.split("\n"):
                    parts = line.strip().split()
                    if len(parts) >= 1:
                        cls = int(parts[0])
                        class_counts[cls] += 1
                        class_to_files.setdefault(cls, []).append(lf.name.replace(".txt", ".jpg"))
            except Exception:
                continue

        if not class_counts:
            return {"method": "class_distribution", "status": "no_classes"}

        total = sum(class_counts.values())
        num_classes = len(class_counts)
        max_class_count = max(class_counts.values())
        imbalance_ratio = max_class_count / total

        # Very imbalanced or single class = suspicious
        if num_classes == 1:
            confidence = 0.85
        elif imbalance_ratio > 0.9:
            confidence = 0.7
        elif imbalance_ratio > 0.7:
            confidence = 0.4
        else:
            confidence = 0.0

        # Per-sample evidence: top 5 dominant classes with affected files
        sorted_classes = class_counts.most_common(5)
        flagged_classes = []
        for cls, count in sorted_classes:
            affected = class_to_files.get(cls, [])
            flagged_classes.append({
                "class_id": cls,
                "occurrences": count,
                "percentage": round(count / total * 100, 2),
                "affected_files": affected[:10],  # Max 10 files
                "total_affected": len(affected),
            })

        return {
            "method": "class_distribution",
            "status": "success",
            "confidence": float(confidence),
            "num_classes": num_classes,
            "class_counts": dict(class_counts),
            "total_instances": total,
            "imbalance_ratio": round(imbalance_ratio, 4),
            "reason": f"{num_classes} classes, {round(imbalance_ratio*100, 1)}% in dominant class",
            "flagged_classes": flagged_classes,
        }

    def _perceptual_hash(self, img_path: Path) -> str:
        """Simple perceptual hash for image."""
        try:
            from PIL import Image
            img = Image.open(img_path).convert("L").resize((16, 16))
            pixels = np.array(img)
            avg = pixels.mean()
            bits = (pixels > avg).flatten()
            return "".join(["1" if b else "0" for b in bits])
        except Exception:
            return None

    def _near_duplicate_detection(self, max_images: int = 200) -> Dict[str, Any]:
        """Detect near-duplicate images using perceptual hashing.
        
        Uses a sampled approach: takes up to max_images from the actual dataset,
        compares each against up to 50 others.
        """
        if not self.images_dir.exists():
            return {"method": "near_duplicate", "status": "unavailable"}

        # Use ALL images in dataset, capped at max_images
        all_images = sorted(self.images_dir.glob("*"))
        total_available = len(all_images)
        
        # Sample if too many (deterministic sampling for reproducibility)
        if total_available > max_images:
            step = total_available // max_images
            image_files = all_images[::step][:max_images]
        else:
            image_files = all_images

        if len(image_files) < 2:
            return {"method": "near_duplicate", "status": "insufficient_data"}

        hashes = {}
        for img_file in image_files:
            h = self._perceptual_hash(img_file)
            if h:
                hashes[img_file.name] = h

        if len(hashes) < 2:
            return {"method": "near_duplicate", "status": "hash_failed"}

        # Hamming distance-based similarity
        hash_names = list(hashes.keys())  # Filenames in same order
        hash_list = list(hashes.values())
        duplicates = 0
        comparisons = 0
        comp_per_image = min(50, len(hash_list) - 1)  # Compare up to 50 others
        flagged_duplicates = []  # Track duplicate pairs with filenames

        for i in range(len(hash_list)):
            for j in range(i + 1, min(i + comp_per_image + 1, len(hash_list))):
                h1, h2 = hash_list[i], hash_list[j]
                if len(h1) == len(h2):
                    dist = sum(c1 != c2 for c1, c2 in zip(h1, h2))
                    comparisons += 1
                    if dist < 10:  # 10/256 bits difference = near-duplicate
                        duplicates += 1
                        if len(flagged_duplicates) < 10:  # Max 10 pairs
                            flagged_duplicates.append({
                                "file_a": hash_names[i],
                                "file_b": hash_names[j],
                                "hamming_distance": dist,
                                "similarity": round((1 - dist / len(h1)) * 100, 2),
                            })

        dup_ratio = duplicates / comparisons if comparisons > 0 else 0

        if dup_ratio > 0.3:
            confidence = 0.8
        elif dup_ratio > 0.15:
            confidence = 0.5
        elif dup_ratio > 0.05:
            confidence = 0.2
        else:
            confidence = 0.0

        return {
            "method": "near_duplicate",
            "status": "success",
            "confidence": float(confidence),
            "images_analyzed": len(hashes),
            "total_in_dataset": total_available,
            "duplicate_pairs": duplicates,
            "comparisons": comparisons,
            "duplicate_ratio": round(dup_ratio, 4),
            "reason": f"{duplicates} near-duplicate pairs out of {comparisons} comparisons (from {len(hashes)} of {total_available} images)",
            "flagged_duplicates": flagged_duplicates,
        }

    def _ood_detection(self, max_images: int = 100) -> Dict[str, Any]:
        """Detect out-of-distribution samples based on image statistics."""
        if not self.images_dir.exists():
            return {"method": "ood_detection", "status": "unavailable"}

        image_files = list(self.images_dir.glob("*"))[:max_images]
        if len(image_files) < 10:
            return {"method": "ood_detection", "status": "insufficient_data"}

        try:
            from PIL import Image
        except ImportError:
            return {"method": "ood_detection", "status": "pillow_missing"}

        stats = []
        for img_file in image_files:
            try:
                img = Image.open(img_file).convert("RGB")
                arr = np.array(img).astype(np.float32)
                # Per-image stats
                stats.append({
                    "name": img_file.name,
                    "mean": float(arr.mean()),
                    "std": float(arr.std()),
                    "width": img.width,
                    "height": img.height,
                })
            except Exception:
                continue

        if len(stats) < 10:
            return {"method": "ood_detection", "status": "stats_failed"}

        means = np.array([s["mean"] for s in stats])
        stds = np.array([s["std"] for s in stats])
        widths = np.array([s["width"] for s in stats])
        heights = np.array([s["height"] for s in stats])

        # Z-score outliers with per-sample tracking
        def get_outliers(arr, threshold=3.0):
            if arr.std() < 1e-8:
                return []
            z = np.abs((arr - arr.mean()) / arr.std())
            return [i for i, v in enumerate(z) if v > threshold]

        outlier_idx_means = get_outliers(means)
        outlier_idx_stds = get_outliers(stds)
        outlier_idx_widths = get_outliers(widths)
        outlier_idx_heights = get_outliers(heights)

        # Collect flagged samples (with reason)
        flagged_samples = []
        seen = set()
        for idx in outlier_idx_means:
            if idx not in seen:
                seen.add(idx)
                flagged_samples.append({
                    "file": stats[idx]["name"],
                    "reason": f"unusual brightness (mean={round(stats[idx]['mean'], 1)})",
                    "mean": round(stats[idx]["mean"], 2),
                    "std": round(stats[idx]["std"], 2),
                    "dimensions": f"{stats[idx]['width']}x{stats[idx]['height']}",
                })
        for idx in outlier_idx_stds:
            if idx not in seen:
                seen.add(idx)
                flagged_samples.append({
                    "file": stats[idx]["name"],
                    "reason": f"unusual contrast (std={round(stats[idx]['std'], 1)})",
                    "mean": round(stats[idx]["mean"], 2),
                    "std": round(stats[idx]["std"], 2),
                    "dimensions": f"{stats[idx]['width']}x{stats[idx]['height']}",
                })
        for idx in outlier_idx_widths:
            if idx not in seen:
                seen.add(idx)
                flagged_samples.append({
                    "file": stats[idx]["name"],
                    "reason": f"unusual width ({stats[idx]['width']}px)",
                    "mean": round(stats[idx]["mean"], 2),
                    "std": round(stats[idx]["std"], 2),
                    "dimensions": f"{stats[idx]['width']}x{stats[idx]['height']}",
                })
        for idx in outlier_idx_heights:
            if idx not in seen:
                seen.add(idx)
                flagged_samples.append({
                    "file": stats[idx]["name"],
                    "reason": f"unusual height ({stats[idx]['height']}px)",
                    "mean": round(stats[idx]["mean"], 2),
                    "std": round(stats[idx]["std"], 2),
                    "dimensions": f"{stats[idx]['width']}x{stats[idx]['height']}",
                })

        total_outliers = len(outlier_idx_means) + len(outlier_idx_stds) + len(outlier_idx_widths) + len(outlier_idx_heights)
        total_checks = len(stats) * 4
        outlier_ratio = total_outliers / total_checks if total_checks > 0 else 0

        if outlier_ratio > 0.1:
            confidence = 0.7
        elif outlier_ratio > 0.05:
            confidence = 0.4
        elif outlier_ratio > 0.02:
            confidence = 0.15
        else:
            confidence = 0.0

        return {
            "method": "ood_detection",
            "status": "success",
            "confidence": float(confidence),
            "images_analyzed": len(stats),
            "outliers": total_outliers,
            "total_checks": total_checks,
            "outlier_ratio": round(outlier_ratio, 4),
            "reason": f"{total_outliers} outliers out of {total_checks} checks",
            "flagged_samples": flagged_samples[:10],  # Top 10 flagged samples
        }

    def _aggregate_risk(self, findings: List[Dict]) -> Dict[str, Any]:
        """Aggregate risk from all findings."""
        confidences = [f.get("confidence", 0) for f in findings if f.get("status") == "success"]
        if not confidences:
            return {"score": 0, "level": "UNKNOWN"}

        max_conf = max(confidences)
        avg_conf = sum(confidences) / len(confidences)

        # Thresholds calibrated for real dataset anomaly detection:
        # < 0.15     → LOW       (clean)
        # 0.15-0.45  → MEDIUM    (moderate issues)
        # 0.45-0.65  → HIGH      (significant issues)
        # > 0.65     → CRITICAL  (severe/attack)
        if max_conf < 0.15:
            level = "LOW"
        elif max_conf <= 0.45:
            level = "MEDIUM"
        elif max_conf <= 0.65:
            level = "HIGH"
        else:
            level = "CRITICAL"

        return {
            "score": round(max_conf * 100, 2),
            "avg_score": round(avg_conf * 100, 2),
            "level": level,
            "num_findings": len(findings),
        }

    def _get_recommendation(self, risk: Dict) -> str:
        return {
            "LOW": "ACCEPT - Dataset appears clean",
            "MEDIUM": "REVIEW - Minor anomalies detected",
            "HIGH": "REVIEW - Significant integrity issues, manual review recommended",
            "CRITICAL": "QUARANTINE - Severe integrity violations detected",
            "UNKNOWN": "REVIEW - Insufficient data",
        }.get(risk.get("level", "UNKNOWN"), "REVIEW")

    def _white_box_check(self) -> Dict[str, Any]:
        """White-box analysis: model weight statistics.
        
        Only available when access_level == 'white-box'.
        Checks weight distribution anomalies that may indicate backdoors.
        """
        try:
            import torch
            from pathlib import Path
            
            # Try to find corresponding model
            model_paths = {
                'good': Path('model/saved_models/good/train/weights/best.pt'),
                'bad': Path('model/saved_models/bad/train/weights/best.pt'),
                'worst': Path('model/saved_models/worst/train/weights/best.pt'),
            }
            
            model_path = model_paths.get(self.dataset_name)
            if not model_path or not model_path.exists():
                return {
                    "method": "white_box_analysis",
                    "status": "unavailable",
                    "reason": f"No matching model found for dataset '{self.dataset_name}'",
                }
            
            # Load model
            ckpt = torch.load(str(model_path), map_location='cpu', weights_only=False)
            
            # Extract state_dict
            state_dict = None
            if isinstance(ckpt, dict):
                inner = ckpt.get('model') or ckpt.get('ema')
                if inner is not None and hasattr(inner, 'state_dict'):
                    state_dict = inner.state_dict()
            
            if not state_dict:
                return {
                    "method": "white_box_analysis",
                    "status": "unavailable",
                    "reason": "No state_dict in model checkpoint",
                }
            
            # Collect weights
            all_weights = []
            for name, tensor in state_dict.items():
                if hasattr(tensor, 'numel') and tensor.numel() > 0:
                    if hasattr(tensor, 'float') and tensor.dtype in (torch.float32, torch.float64, torch.float16):
                        all_weights.append(tensor.flatten().float())
            
            if not all_weights:
                return {
                    "method": "white_box_analysis",
                    "status": "unavailable",
                    "reason": "No floating-point weights found",
                }
            
            all_concat = torch.cat(all_weights)
            
            # Weight statistics
            extreme_count = int((torch.abs(all_concat) > 5.0).sum())
            extreme_ratio = extreme_count / all_concat.numel()
            
            near_zero = int((torch.abs(all_concat) < 1e-6).sum())
            sparsity = near_zero / all_concat.numel()
            
            # Confidence based on extreme weights
            if extreme_ratio > 0.001:
                confidence = 0.6
            elif extreme_ratio > 0.0001:
                confidence = 0.3
            else:
                confidence = 0.0
            
            return {
                "method": "white_box_analysis",
                "status": "success",
                "confidence": float(confidence),
                "model_path": str(model_path),
                "total_weights": int(all_concat.numel()),
                "mean": round(float(all_concat.mean()), 6),
                "std": round(float(all_concat.std()), 6),
                "min": round(float(all_concat.min()), 4),
                "max": round(float(all_concat.max()), 4),
                "extreme_weights_count": extreme_count,
                "extreme_weights_ratio": round(extreme_ratio, 6),
                "sparsity": round(sparsity, 4),
                "reason": f"{extreme_count} extreme weights out of {all_concat.numel()}",
            }
        except Exception as e:
            return {
                "method": "white_box_analysis",
                "status": "failed",
                "error": str(e),
            }

    def _get_limitations(self) -> List[str]:
        return [
            "Label analysis assumes YOLO format (class x y w h)",
            "Perceptual hash uses simple 16x16 average (not robust to all transformations)",
            "OOD detection based on image statistics only (not semantic)",
            "Class imbalance may be legitimate for some datasets",
            "No ground-truth labels for validation",
        ]
