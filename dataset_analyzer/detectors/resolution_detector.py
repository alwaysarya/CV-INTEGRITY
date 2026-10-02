"""Resolution detector"""


class ResolutionDetector:
    def __init__(self, min_width=224, min_height=224):
        self.min_w = min_width
        self.min_h = min_height

    def detect(self, image):
        if image is None:
            return {"status": "no_image", "width": 0, "height": 0}
        if hasattr(image, 'shape'):
            h, w = image.shape[:2]
        else:
            h, w = 0, 0
        low_res = (w < self.min_w) or (h < self.min_h)
        return {
            "status": "analyzed",
            "width": w,
            "height": h,
            "low_resolution": low_res,
            "ok": not low_res,
        }
