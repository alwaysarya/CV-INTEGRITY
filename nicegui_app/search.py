"""
Global Search Module
Search across all pages, datasets, models, and features.
"""

from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent


# Search index — all pages and features
SEARCH_INDEX = [
    # Data
    {'title': 'Upload Dataset', 'path': '/upload', 'category': 'Data', 'keywords': ['upload', 'file', 'dataset', 'hash', 'sha256']},
    {'title': 'Datasets Library', 'path': '/datasets', 'category': 'Data', 'keywords': ['datasets', 'files', 'library', 'list']},
    {'title': 'Dataset Quality', 'path': '/quality', 'category': 'Data', 'keywords': ['quality', 'blur', 'noise', 'duplicate']},
    {'title': 'Format Support', 'path': '/formats', 'category': 'Data', 'keywords': ['coco', 'yolo', 'onnx', 'pytorch', 'formats']},
    
    # Models
    {'title': 'Model Integrity', 'path': '/model-integrity', 'category': 'Models', 'keywords': ['integrity', 'sha256', 'fingerprint', 'trigger']},
    {'title': 'Model Performance', 'path': '/performance', 'category': 'Models', 'keywords': ['performance', 'precision', 'recall', 'map50']},
    {'title': 'Robustness Testing', 'path': '/robustness', 'category': 'Models', 'keywords': ['robustness', 'stress', 'attack', 'resilience']},
    {'title': 'Model Drift', 'path': '/drift', 'category': 'Models', 'keywords': ['drift', 'monitoring', 'calibration', 'risk']},
    
    # Security
    {'title': 'Blockchain', 'path': '/blockchain', 'category': 'Security', 'keywords': ['blockchain', 'blocks', 'hash', 'chain', 'pow']},
    {'title': 'Cybersecurity', 'path': '/cybersecurity', 'category': 'Security', 'keywords': ['cyber', 'attacks', 'security', 'detection']},
    {'title': 'Backdoor Detection', 'path': '/backdoor', 'category': 'Security', 'keywords': ['backdoor', 'trigger', 'anomaly', 'ood']},
    {'title': 'Replay Prevention', 'path': '/replay', 'category': 'Security', 'keywords': ['replay', 'nonce', 'timestamp', 'sequence']},
    {'title': 'Wallet', 'path': '/wallet', 'category': 'Security', 'keywords': ['wallet', 'cvit', 'tokens', 'balance']},
    {'title': 'Attack Simulator', 'path': '/attack-simulator', 'category': 'Security', 'keywords': ['attack', 'simulator', 'blur', 'noise', 'poison']},
    
    # Analytics
    {'title': 'Analytics Dashboard', 'path': '/analytics', 'category': 'Analytics', 'keywords': ['analytics', 'dashboard', 'metrics', 'charts']},
    {'title': 'Reports', 'path': '/reports', 'category': 'Analytics', 'keywords': ['reports', 'pdf', 'certificate', 'coverage']},
    {'title': 'XAI Visualizer', 'path': '/xai', 'category': 'Analytics', 'keywords': ['xai', 'gradcam', 'heatmap', 'explainable']},
    {'title': 'Video Analysis', 'path': '/video', 'category': 'Analytics', 'keywords': ['video', 'detection', 'yolo', 'frames']},
    
    # Team
    {'title': 'Collaboration', 'path': '/collaboration', 'category': 'Team', 'keywords': ['collaboration', 'tasks', 'comments', 'activity']},
    {'title': 'Contributors', 'path': '/contributors', 'category': 'Team', 'keywords': ['contributors', 'risk', 'source', 'trust']},
    {'title': 'Trust Score', 'path': '/trust', 'category': 'Team', 'keywords': ['trust', 'score', 'gauge', 'decision']},
    
    # Other
    {'title': 'Home', 'path': '/', 'category': 'Other', 'keywords': ['home', 'landing', 'main']},
    {'title': 'Solutions', 'path': '/solutions', 'category': 'Other', 'keywords': ['solutions', 'features']},
    {'title': 'About', 'path': '/about', 'category': 'Other', 'keywords': ['about', 'mission', 'team']},
]


def search(query, limit=10):
    """
    Search across all pages and features.
    
    Args:
        query: Search string
        limit: Max results
    
    Returns:
        List of matching items
    """
    if not query or len(query) < 1:
        return []
    
    query_lower = query.lower().strip()
    results = []
    
    for item in SEARCH_INDEX:
        score = 0
        
        # Title match (highest priority)
        if query_lower in item['title'].lower():
            score += 100
            if item['title'].lower().startswith(query_lower):
                score += 50
        
        # Keyword match
        for keyword in item['keywords']:
            if query_lower in keyword.lower():
                score += 30
                if keyword.lower().startswith(query_lower):
                    score += 20
        
        # Category match
        if query_lower in item['category'].lower():
            score += 10
        
        if score > 0:
            results.append({
                **item,
                'score': score,
            })
    
    # Sort by score
    results.sort(key=lambda x: x['score'], reverse=True)
    
    return results[:limit]


if __name__ == '__main__':
    # Test
    print("=== SEARCH TEST ===")
    for query in ['block', 'xai', 'attack', 'trust', 'perf']:
        results = search(query, limit=3)
        print(f"\nQuery: '{query}'")
        for r in results:
            print(f"  → {r['title']} ({r['category']}) — score: {r['score']}")
