"""
Collaboration Engine
Manages comments, tasks, activity feed, and notifications
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
from pathlib import Path
from datetime import datetime


class CollaborationEngine:
    """Manages collaboration features"""
    
    def __init__(self, storage_dir='outputs/collaboration'):
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        
        self.comments_file = self.storage_dir / 'comments.json'
        self.tasks_file = self.storage_dir / 'tasks.json'
        self.activities_file = self.storage_dir / 'activities.json'
        self.notifications_file = self.storage_dir / 'notifications.json'
        
        self.comments = self._load(self.comments_file, [])
        self.tasks = self._load(self.tasks_file, [])
        self.activities = self._load(self.activities_file, [])
        self.notifications = self._load(self.notifications_file, [])
    
    def _load(self, path, default):
        """Load JSON file"""
        if path.exists():
            try:
                with open(path, 'r') as f:
                    return json.load(f)
            except:
                return default
        return default
    
    def _save(self, path, data):
        """Save JSON file"""
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)
    
    # ============================================================
    # COMMENTS
    # ============================================================
    
    def add_comment(self, username, resource_type, resource_id, text):
        """Add a comment to a resource"""
        comment = {
            'id': len(self.comments) + 1,
            'username': username,
            'resource_type': resource_type,  # dataset, model, block, etc.
            'resource_id': resource_id,
            'text': text,
            'created_at': datetime.now().isoformat(),
            'likes': 0,
            'replies': []
        }
        
        self.comments.append(comment)
        self._save(self.comments_file, self.comments)
        
        # Log activity
        self.log_activity(username, 'comment_added', {
            'resource_type': resource_type,
            'resource_id': resource_id,
            'comment_id': comment['id']
        })
        
        return comment
    
    def get_comments(self, resource_type=None, resource_id=None):
        """Get comments, optionally filtered"""
        results = self.comments
        
        if resource_type:
            results = [c for c in results if c['resource_type'] == resource_type]
        
        if resource_id:
            results = [c for c in results if c['resource_id'] == resource_id]
        
        return sorted(results, key=lambda x: x['created_at'], reverse=True)
    
    def like_comment(self, comment_id, username):
        """Like a comment"""
        for comment in self.comments:
            if comment['id'] == comment_id:
                comment['likes'] += 1
                self._save(self.comments_file, self.comments)
                return {'status': 'success', 'likes': comment['likes']}
        
        return {'status': 'error', 'message': 'Comment not found'}
    
    def delete_comment(self, comment_id, username):
        """Delete a comment"""
        self.comments = [c for c in self.comments if c['id'] != comment_id]
        self._save(self.comments_file, self.comments)
        return {'status': 'success'}
    
    # ============================================================
    # TASKS
    # ============================================================
    
    def create_task(self, creator, assignee, title, description, priority='medium'):
        """Create a new task"""
        task = {
            'id': len(self.tasks) + 1,
            'creator': creator,
            'assignee': assignee,
            'title': title,
            'description': description,
            'priority': priority,  # low, medium, high, critical
            'status': 'pending',  # pending, in_progress, completed, cancelled
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'completed_at': None
        }
        
        self.tasks.append(task)
        self._save(self.tasks_file, self.tasks)
        
        # Log activity
        self.log_activity(creator, 'task_created', {
            'task_id': task['id'],
            'assignee': assignee,
            'title': title
        })
        
        # Send notification to assignee
        self.send_notification(
            assignee,
            f"New task assigned: {title}",
            'task',
            {'task_id': task['id'], 'priority': priority}
        )
        
        return task
    
    def update_task_status(self, task_id, status, username):
        """Update task status"""
        for task in self.tasks:
            if task['id'] == task_id:
                old_status = task['status']
                task['status'] = status
                task['updated_at'] = datetime.now().isoformat()
                
                if status == 'completed':
                    task['completed_at'] = datetime.now().isoformat()
                
                self._save(self.tasks_file, self.tasks)
                
                self.log_activity(username, 'task_updated', {
                    'task_id': task_id,
                    'old_status': old_status,
                    'new_status': status
                })
                
                return {'status': 'success', 'task': task}
        
        return {'status': 'error', 'message': 'Task not found'}
    
    def get_tasks(self, assignee=None, status=None):
        """Get tasks, optionally filtered"""
        results = self.tasks
        
        if assignee:
            results = [t for t in results if t['assignee'] == assignee]
        
        if status:
            results = [t for t in results if t['status'] == status]
        
        return sorted(results, key=lambda x: x['created_at'], reverse=True)
    
    # ============================================================
    # ACTIVITY FEED
    # ============================================================
    
    def log_activity(self, username, action, details=None):
        """Log an activity"""
        activity = {
            'id': len(self.activities) + 1,
            'username': username,
            'action': action,
            'details': details or {},
            'timestamp': datetime.now().isoformat()
        }
        
        self.activities.append(activity)
        
        # Keep only last 500 activities
        if len(self.activities) > 500:
            self.activities = self.activities[-500:]
        
        self._save(self.activities_file, self.activities)
        return activity
    
    def get_activities(self, limit=50):
        """Get recent activities"""
        return sorted(self.activities, key=lambda x: x['timestamp'], reverse=True)[:limit]
    
    # ============================================================
    # NOTIFICATIONS
    # ============================================================
    
    def send_notification(self, recipient, message, notification_type='info', data=None):
        """Send a notification to a user"""
        notification = {
            'id': len(self.notifications) + 1,
            'recipient': recipient,
            'message': message,
            'type': notification_type,  # info, warning, success, error, task
            'data': data or {},
            'read': False,
            'created_at': datetime.now().isoformat()
        }
        
        self.notifications.append(notification)
        self._save(self.notifications_file, self.notifications)
        return notification
    
    def get_notifications(self, username, unread_only=False):
        """Get notifications for a user"""
        results = [n for n in self.notifications if n['recipient'] == username]
        
        if unread_only:
            results = [n for n in results if not n['read']]
        
        return sorted(results, key=lambda x: x['created_at'], reverse=True)
    
    def mark_as_read(self, notification_id):
        """Mark notification as read"""
        for notif in self.notifications:
            if notif['id'] == notification_id:
                notif['read'] = True
                self._save(self.notifications_file, self.notifications)
                return {'status': 'success'}
        
        return {'status': 'error', 'message': 'Notification not found'}
    
    def get_stats(self):
        """Get collaboration statistics"""
        return {
            'total_comments': len(self.comments),
            'total_tasks': len(self.tasks),
            'pending_tasks': len([t for t in self.tasks if t['status'] == 'pending']),
            'completed_tasks': len([t for t in self.tasks if t['status'] == 'completed']),
            'total_activities': len(self.activities),
            'unread_notifications': len([n for n in self.notifications if not n['read']])
        }


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🤝 COLLABORATION ENGINE DEMO")
    print("="*60 + "\n")
    
    engine = CollaborationEngine()
    
    # ============================================================
    # TEST 1: Comments
    # ============================================================
    print("💬 Test 1: Comments")
    print("-" * 40)
    
    comment1 = engine.add_comment(
        username='arya',
        resource_type='dataset',
        resource_id='good_dataset',
        text='Great dataset! Quality is excellent.'
    )
    print(f"   ✅ Comment added by arya: {comment1['text'][:40]}...")
    
    comment2 = engine.add_comment(
        username='reviewer1',
        resource_type='dataset',
        resource_id='good_dataset',
        text='Reviewed and approved.'
    )
    print(f"   ✅ Comment added by reviewer1: {comment2['text'][:40]}...")
    
    # Like comment
    engine.like_comment(comment1['id'], 'reviewer1')
    print(f"   👍 Comment liked")
    
    # Get comments
    comments = engine.get_comments('dataset', 'good_dataset')
    print(f"   📝 Total comments on good_dataset: {len(comments)}")
    
    # ============================================================
    # TEST 2: Tasks
    # ============================================================
    print("\n📋 Test 2: Tasks")
    print("-" * 40)
    
    task1 = engine.create_task(
        creator='arya',
        assignee='contributor1',
        title='Train YOLOv8 on new dataset',
        description='Train model on BAD dataset variant',
        priority='high'
    )
    print(f"   ✅ Task created: {task1['title']}")
    
    task2 = engine.create_task(
        creator='arya',
        assignee='reviewer1',
        title='Review blockchain integrity',
        description='Verify all blocks and signatures',
        priority='critical'
    )
    print(f"   ✅ Task created: {task2['title']}")
    
    # Update task status
    engine.update_task_status(task1['id'], 'in_progress', 'contributor1')
    print(f"   🔄 Task 1 status: in_progress")
    
    engine.update_task_status(task1['id'], 'completed', 'contributor1')
    print(f"   ✅ Task 1 status: completed")
    
    # ============================================================
    # TEST 3: Activities
    # ============================================================
    print("\n📊 Test 3: Activity Feed")
    print("-" * 40)
    
    activities = engine.get_activities(limit=10)
    print(f"   📝 Recent activities: {len(activities)}")
    for act in activities[:5]:
        print(f"      • {act['username']} → {act['action']}")
    
    # ============================================================
    # TEST 4: Notifications
    # ============================================================
    print("\n🔔 Test 4: Notifications")
    print("-" * 40)
    
    notifs = engine.get_notifications('contributor1')
    print(f"   📬 Notifications for contributor1: {len(notifs)}")
    for notif in notifs:
        status = "✅ Read" if notif['read'] else "📬 Unread"
        print(f"      {status}: {notif['message']}")
    
    # ============================================================
    # STATS
    # ============================================================
    print("\n" + "="*60)
    print("📊 COLLABORATION STATS")
    print("="*60)
    
    stats = engine.get_stats()
    for key, value in stats.items():
        print(f"   {key.replace('_', ' ').title()}: {value}")
    
    print("\n" + "="*60)
    print("✅ Collaboration Engine ready!")
    print("="*60)