"""Image quality scorer"""
from dataset_analyzer.scorers.dataset_scorer import DatasetScorer


def score_images(image_paths):
    return DatasetScorer().score_images(image_paths)
