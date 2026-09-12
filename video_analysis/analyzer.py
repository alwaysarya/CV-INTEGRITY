"""
Video Analysis Module
Frame-by-frame object detection and tracking
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import cv2
import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict


class VideoAnalyzer:
    """Video analyzer with YOLO detection and tracking"""
    
    def __init__(self, model_path):
        """
        Initialize video analyzer
        
        Args:
            model_path: Path to YOLO model
        """
        try:
            from ultralytics import YOLO
            self.model = YOLO(model_path)
            self.model_path = model_path
            self.available = True
        except Exception as e:
            print(f"⚠️ Model load failed: {e}")
            self.available = False
        
        self.class_names = ['car', 'bicycle', 'bus', 'truck']
        self.output_dir = Path('outputs/video_analysis')
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def analyze_video(self, video_path, output_name=None, conf_threshold=0.5):
        """
        Analyze video with frame-by-frame detection
        
        Args:
            video_path: Path to input video
            output_name: Name for output files
            conf_threshold: Confidence threshold
        
        Returns:
            dict: Analysis results
        """
        if not self.available:
            return {'error': 'Model not available'}
        
        video_path = Path(video_path)
        if not video_path.exists():
            return {'error': f'Video not found: {video_path}'}
        
        print(f"\n🎥 Processing video: {video_path.name}")
        
        # Open video
        cap = cv2.VideoCapture(str(video_path))
        
        if not cap.isOpened():
            return {'error': 'Could not open video'}
        
        # Get video properties
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        duration = total_frames / fps if fps > 0 else 0
        
        print(f"   📊 Video: {width}x{height} @ {fps}fps, {total_frames} frames ({duration:.1f}s)")
        
        # Output paths
        if output_name is None:
            output_name = f"{video_path.stem}_{datetime.now().strftime('%H%M%S')}"
        
        output_video_path = self.output_dir / f"{output_name}_annotated.mp4"
        output_json_path = self.output_dir / f"{output_name}_analysis.json"
        
        # Video writer
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(str(output_video_path), fourcc, fps, (width, height))
        
        # Analysis data
        frame_data = []
        class_counts = defaultdict(int)
        total_detections = 0
        frames_with_detections = 0
        
        # Process every Nth frame for speed (skip 2 frames = process 1/3)
        frame_skip = 2
        processed_frames = 0
        
        frame_idx = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Process every Nth frame
            if frame_idx % (frame_skip + 1) == 0:
                # Run detection
                results = self.model(frame, conf=conf_threshold, verbose=False)
                
                # Annotate frame
                if len(results) > 0:
                    annotated = results[0].plot()
                    
                    # Extract detections
                    boxes = results[0].boxes
                    if boxes is not None and len(boxes) > 0:
                        frame_detections = []
                        for box in boxes:
                            cls_id = int(box.cls[0])
                            conf = float(box.conf[0])
                            xyxy = box.xyxy[0].cpu().numpy().tolist()
                            
                            class_name = self.class_names[cls_id] if cls_id < len(self.class_names) else f'class_{cls_id}'
                            
                            frame_detections.append({
                                'class': class_name,
                                'class_id': cls_id,
                                'confidence': round(conf, 3),
                                'bbox': [round(x, 1) for x in xyxy]
                            })
                            
                            class_counts[class_name] += 1
                            total_detections += 1
                        
                        frames_with_detections += 1
                        
                        frame_data.append({
                            'frame': frame_idx,
                            'timestamp': round(frame_idx / fps, 2) if fps > 0 else 0,
                            'detections': frame_detections,
                            'count': len(frame_detections)
                        })
                    
                    out.write(annotated)
                else:
                    out.write(frame)
                
                processed_frames += 1
            else:
                out.write(frame)
            
            frame_idx += 1
            
            # Progress every 30 frames
            if frame_idx % 30 == 0:
                progress = (frame_idx / total_frames) * 100
                print(f"   ⏳ Progress: {progress:.1f}% ({frame_idx}/{total_frames})")
        
        cap.release()
        out.release()
        
        # Calculate statistics
        avg_detections_per_frame = total_detections / processed_frames if processed_frames > 0 else 0
        detection_rate = (frames_with_detections / processed_frames) * 100 if processed_frames > 0 else 0
        
        # Build analysis
        analysis = {
            'video_name': video_path.name,
            'analyzed_at': datetime.now().isoformat(),
            'video_info': {
                'fps': fps,
                'total_frames': total_frames,
                'duration_seconds': round(duration, 2),
                'resolution': f"{width}x{height}"
            },
            'analysis_info': {
                'processed_frames': processed_frames,
                'frame_skip': frame_skip,
                'confidence_threshold': conf_threshold,
                'model': Path(self.model_path).parent.parent.parent.name
            },
            'results': {
                'total_detections': total_detections,
                'frames_with_detections': frames_with_detections,
                'detection_rate_percent': round(detection_rate, 2),
                'avg_detections_per_frame': round(avg_detections_per_frame, 2),
                'class_distribution': dict(class_counts)
            },
            'frame_details': frame_data[:100],  # First 100 frames
            'output_files': {
                'annotated_video': str(output_video_path),
                'analysis_json': str(output_json_path)
            }
        }
        
        # Save analysis JSON
        with open(output_json_path, 'w') as f:
            json.dump(analysis, f, indent=2)
        
        print(f"\n✅ Video analysis complete!")
        print(f"   📹 Annotated: {output_video_path}")
        print(f"   📄 Analysis: {output_json_path}")
        print(f"   📊 Total detections: {total_detections}")
        print(f"   📈 Detection rate: {detection_rate:.1f}%")
        
        return analysis
    
    def get_video_preview(self, video_path, frame_index=0):
        """Get a single frame preview"""
        cap = cv2.VideoCapture(str(video_path))
        
        if not cap.isOpened():
            return None
        
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_index)
        ret, frame = cap.read()
        cap.release()
        
        if not ret:
            return None
        
        return frame


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🎥 VIDEO ANALYSIS DEMO")
    print("="*60)
    
    # Check for models
    model_path = "model/saved_models/good/train/weights/best.pt"
    
    if not Path(model_path).exists():
        print(f"❌ Model not found: {model_path}")
        exit(1)
    
    print(f"\n📁 Loading model: {model_path}")
    analyzer = VideoAnalyzer(model_path)
    
    if not analyzer.available:
        print("❌ Model could not be loaded")
        exit(1)
    
    print("✅ Model loaded")
    
    # Check for test videos
    video_dir = Path("datasets/videos")
    video_dir.mkdir(parents=True, exist_ok=True)
    
    test_videos = list(video_dir.glob("*.mp4")) + list(video_dir.glob("*.avi"))
    
    if not test_videos:
        print(f"\n⚠️  No test videos found in {video_dir}")
        print("   Create a test video or download one to test.")
        print("\n   To test video analysis:")
        print("   1. Place an MP4/AVI video in datasets/videos/")
        print("   2. Run this script again")
        print("\n✅ Video Analyzer module ready!")
        exit(0)
    
    # Analyze first video
    test_video = test_videos[0]
    print(f"\n🎥 Analyzing: {test_video.name}")
    
    result = analyzer.analyze_video(test_video)
    
    if 'error' in result:
        print(f"❌ Error: {result['error']}")
    else:
        print(f"\n✅ Analysis complete!")
        print(f"   Detections: {result['results']['total_detections']}")
        print(f"   Classes: {result['results']['class_distribution']}")
    
    print("\n" + "="*60)
    print("✅ Video Analyzer ready!")
    print("="*60)