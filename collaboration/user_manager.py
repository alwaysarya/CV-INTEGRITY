"""
User Manager
Manages users, roles, and permissions
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
import hashlib
import secrets
from pathlib import Path
from datetime import datetime


class UserManager:
    """Manage users, roles, and permissions"""
    
    def __init__(self, storage_path='outputs/reports/users.json'):
        self.storage_path = Path(storage_path)
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Define roles and permissions
        self.roles = {
            'admin': {
                'permissions': ['*'],  # All permissions
                'description': 'Full system access'
            },
            'contributor': {
                'permissions': [
                    'upload_dataset', 'train_model', 'view_results',
                    'add_comment', 'generate_reports'
                ],
                'description': 'Upload data and train models'
            },
            'reviewer': {
                'permissions': [
                    'view_results', 'verify_integrity', 'approve_model',
                    'add_comment', 'reject_model'
                ],
                'description': 'Review and approve models'
            },
            'viewer': {
                'permissions': ['view_results', 'add_comment'],
                'description': 'Read-only access'
            }
        }
        
        self.users = self._load_users()
    
    def _load_users(self):
        """Load users from storage"""
        if self.storage_path.exists():
            try:
                with open(self.storage_path, 'r') as f:
                    return json.load(f)
            except:
                pass
        return {}
    
    def _save_users(self):
        """Save users to storage"""
        with open(self.storage_path, 'w') as f:
            json.dump(self.users, f, indent=2)
    
    def _hash_password(self, password, salt=None):
        """Hash password with salt"""
        if salt is None:
            salt = secrets.token_hex(16)
        
        password_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode(),
            salt.encode(),
            100000
        ).hex()
        
        return {'hash': password_hash, 'salt': salt}
    
    def _verify_password(self, password, stored_hash, salt):
        """Verify password"""
        new_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode(),
            salt.encode(),
            100000
        ).hex()
        
        return new_hash == stored_hash
    
    def create_user(self, username, password, role='viewer', email=None):
        """Create a new user"""
        if username in self.users:
            return {'status': 'error', 'message': 'User already exists'}
        
        if role not in self.roles:
            return {'status': 'error', 'message': f'Invalid role: {role}'}
        
        password_data = self._hash_password(password)
        
        self.users[username] = {
            'username': username,
            'email': email,
            'role': role,
            'password_hash': password_data['hash'],
            'salt': password_data['salt'],
            'created_at': datetime.now().isoformat(),
            'last_login': None,
            'active': True,
            'avatar': username[0].upper()
        }
        
        self._save_users()
        
        return {
            'status': 'success',
            'user': {
                'username': username,
                'role': role,
                'email': email
            }
        }
    
    def authenticate(self, username, password):
        """Authenticate user"""
        if username not in self.users:
            return {'status': 'error', 'message': 'User not found'}
        
        user = self.users[username]
        
        if not user.get('active'):
            return {'status': 'error', 'message': 'User is inactive'}
        
        if not self._verify_password(password, user['password_hash'], user['salt']):
            return {'status': 'error', 'message': 'Invalid password'}
        
        # Update last login
        self.users[username]['last_login'] = datetime.now().isoformat()
        self._save_users()
        
        return {
            'status': 'success',
            'user': {
                'username': username,
                'role': user['role'],
                'email': user.get('email'),
                'avatar': user.get('avatar', username[0].upper())
            }
        }
    
    def check_permission(self, username, permission):
        """Check if user has permission"""
        if username not in self.users:
            return False
        
        user = self.users[username]
        if not user.get('active'):
            return False
        
        role = user.get('role', 'viewer')
        role_permissions = self.roles.get(role, {}).get('permissions', [])
        
        # Admin has all permissions
        if '*' in role_permissions:
            return True
        
        return permission in role_permissions
    
    def get_user(self, username):
        """Get user details"""
        if username not in self.users:
            return None
        
        user = self.users[username].copy()
        # Remove sensitive info
        user.pop('password_hash', None)
        user.pop('salt', None)
        
        return user
    
    def get_all_users(self):
        """Get all users (without passwords)"""
        result = []
        for username, user in self.users.items():
            user_copy = user.copy()
            user_copy.pop('password_hash', None)
            user_copy.pop('salt', None)
            result.append(user_copy)
        return result
    
    def update_user_role(self, username, new_role):
        """Update user role"""
        if username not in self.users:
            return {'status': 'error', 'message': 'User not found'}
        
        if new_role not in self.roles:
            return {'status': 'error', 'message': f'Invalid role: {new_role}'}
        
        self.users[username]['role'] = new_role
        self.users[username]['updated_at'] = datetime.now().isoformat()
        self._save_users()
        
        return {'status': 'success', 'message': f'Role updated to {new_role}'}
    
    def deactivate_user(self, username):
        """Deactivate user"""
        if username not in self.users:
            return {'status': 'error', 'message': 'User not found'}
        
        self.users[username]['active'] = False
        self.users[username]['deactivated_at'] = datetime.now().isoformat()
        self._save_users()
        
        return {'status': 'success', 'message': f'{username} deactivated'}
    
    def get_role_info(self):
        """Get all roles and their permissions"""
        return self.roles


if __name__ == "__main__":
    print("\n" + "="*60)
    print("👥 USER MANAGER DEMO")
    print("="*60 + "\n")
    
    manager = UserManager()
    
    # Create demo users
    print("📝 Creating users...")
    
    users_to_create = [
        ('arya', 'password123', 'admin', 'arya@example.com'),
        ('contributor1', 'password123', 'contributor', 'contrib@example.com'),
        ('reviewer1', 'password123', 'reviewer', 'reviewer@example.com'),
        ('viewer1', 'password123', 'viewer', 'viewer@example.com')
    ]
    
    for username, password, role, email in users_to_create:
        result = manager.create_user(username, password, role, email)
        if result['status'] == 'success':
            print(f"   ✅ {username} ({role})")
        else:
            print(f"   ⚠️  {username}: {result['message']}")
    
    print("\n" + "="*60)
    print("🔐 AUTHENTICATION TEST")
    print("="*60)
    
    # Test authentication
    result = manager.authenticate('arya', 'password123')
    if result['status'] == 'success':
        print(f"   ✅ Login successful: {result['user']['username']} ({result['user']['role']})")
    
    # Test wrong password
    result = manager.authenticate('arya', 'wrongpassword')
    print(f"   ❌ Wrong password: {result['message']}")
    
    print("\n" + "="*60)
    print("🔑 PERMISSION TESTS")
    print("="*60)
    
    permissions_to_test = [
        ('arya', 'deploy_model'),
        ('contributor1', 'upload_dataset'),
        ('contributor1', 'deploy_model'),
        ('reviewer1', 'approve_model'),
        ('reviewer1', 'upload_dataset'),
        ('viewer1', 'view_results'),
        ('viewer1', 'train_model')
    ]
    
    for username, permission in permissions_to_test:
        has_perm = manager.check_permission(username, permission)
        icon = "✅" if has_perm else "❌"
        print(f"   {icon} {username} → {permission}")
    
    print("\n" + "="*60)
    print("📊 ALL USERS")
    print("="*60)
    
    all_users = manager.get_all_users()
    for user in all_users:
        print(f"   👤 {user['username']} — {user['role']} — {'Active' if user.get('active') else 'Inactive'}")
    
    print("\n" + "="*60)
    print("✅ User Manager ready!")
    print("="*60)