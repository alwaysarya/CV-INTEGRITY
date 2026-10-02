"""
Logging configuration for CV-INTEGRITY
"""

import sys
import os
from pathlib import Path
from loguru import logger

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from configs.constants import LOG_FORMAT, LOG_ROTATION, LOG_RETENTION

def setup_logger():
    """Setup loguru logger with file and console handlers"""
    
    # Remove default handler
    logger.remove()
    
    # Console handler
    logger.add(
        sys.stdout,
        format=LOG_FORMAT,
        level="INFO",
        colorize=True
    )
    
    # File handler
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    logger.add(
        log_dir / "app.log",
        format=LOG_FORMAT,
        rotation=LOG_ROTATION,
        retention=LOG_RETENTION,
        level="DEBUG"
    )
    
    return logger

# Global logger instance
logger = setup_logger()

def get_logger(name=None):
    """Get logger instance"""
    if name:
        return logger.bind(name=name)
    return logger

if __name__ == "__main__":
    logger.info("Logger initialized successfully!")
