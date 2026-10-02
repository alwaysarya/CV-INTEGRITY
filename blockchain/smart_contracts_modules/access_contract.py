"""
Access Control Smart Contract
Manage permissions for multi-contributor pipeline
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
from datetime import datetime
from pathlib import Path


class AccessContract:
    """Smart Contract for Access Control"""
    
    def __init__(self):
        self.roles = {
            'admin': ['upload', 'train', 'verify', 'deploy', 'revoke'],
            'contributor': ['upload', 'train'],
            'reviewer': ['verify'],
            'viewer': ['read']
        }
        self.users = {}
        self.contract_address = "0xACCESS_CONTRACT_v1"
    
    def register_user(self, username, role):
        """Register a user with a role"""
        if role not in self.roles:
            return {'status': 'error', 'message': f'Invalid role: {role}'}
        
        self.users[username] = {
            'username': username,
            'role': role,
            'permissions': self.roles[role],
            'registered_at': datetime.now().isoformat(),
            'active': True
        }
        
        self._save_users()
        return {'status': 'success', 'user': self.users[username]}
    
    def check_permission(self, username, action):
        """Check if user has permission for action"""
        if username not in self.users:
            return {'allowed': False, 'reason': 'User not registered'}
        
        user = self.users[username]
        if not user.get('active'):
            return {'allowed': False, 'reason': 'User is inactive'}
        
        if action in user['permissions']:
            return {'allowed': True, 'user': username, 'role': user['role']}
        else:
            return {'allowed': False, 'reason': f'Role {user["role"]} cannot perform {action}'}
    
    def revoke_user(self, username):
        """Revoke user access"""
        if username in self.users:
            self.users[username]['active'] = False
            self.users[username]['revoked_at'] = datetime.now().isoformat()
            self._save_users()
            return {'status': 'success', 'message': f'{username} revoked'}
        return {'status': 'error', 'message': 'User not found'}
    
    def _save_users(self):
        """Save users to file"""
        path = Path('outputs/reports/access_control.json')
        path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(path, 'w') as f:
            json.dump({
                'contract_address': self.contract_address,
                'roles': self.roles,
                'users': self.users,
                'last_updated': datetime.now().isoformat()
            }, f, indent=2)


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🔐 ACCESS CONTROL CONTRACT")
    print("="*60 + "\n")
    
    contract = AccessContract()
    
    # Register users
    print("📝 Registering users...")
    contract.register_user("Arya Ranjan", "admin")
    print("   ✅ Arya Ranjan → admin")
    
    contract.register_user("Contributor1", "contributor")
    print("   ✅ Contributor1 → contributor")
    
    contract.register_user("Reviewer1", "reviewer")
    print("   ✅ Reviewer1 → reviewer")
    
    # Test permissions
    print("\n🔍 Testing permissions...")
    
    tests = [
        ("Arya Ranjan", "deploy"),
        ("Contributor1", "upload"),
        ("Contributor1", "deploy"),
        ("Reviewer1", "verify"),
        ("Reviewer1", "upload")
    ]
    
    for user, action in tests:
        result = contract.check_permission(user, action)
        status = "✅ ALLOWED" if result['allowed'] else "❌ DENIED"
        print(f"   {status}: {user} → {action}")
    
    print("\n" + "="*60)
    print("✅ Access Control ready!")
    print("="*60)