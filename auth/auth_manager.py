"""
Authentication Manager
OAuth2-inspired authentication with session management
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
import hashlib
import secrets
import base64
from pathlib import Path
from datetime import datetime, timedelta


class AuthManager:
    """Manages authentication and sessions"""
    
    def __init__(self, storage_dir='outputs/auth'):
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        
        self.users_file = self.storage_dir / 'auth_users.json'
        self.sessions_file = self.storage_dir / 'sessions.json'
        self.tokens_file = self.storage_dir / 'tokens.json'
        
        self.users = self._load(self.users_file, {})
        self.sessions = self._load(self.sessions_file, {})
        self.tokens = self._load(self.tokens_file, {})
        
        # Session expiry (24 hours)
        self.session_expiry_hours = 24
    
    def _load(self, path, default):
        if path.exists():
            try:
                with open(path, 'r') as f:
                    return json.load(f)
            except:
                return default
        return default
    
    def _save(self, path, data):
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)
    
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
        
        return password_hash, salt
    
    def _generate_token(self):
        """Generate secure token"""
        return secrets.token_urlsafe(32)
    
    # ============================================================
    # USER REGISTRATION
    # ============================================================
    
    def register(self, username, password, email=None, provider='local'):
        """Register a new user"""
        if username in self.users:
            return {'status': 'error', 'message': 'Username already taken'}
        
        password_hash, salt = self._hash_password(password)
        
        self.users[username] = {
            'username': username,
            'email': email or f"{username}@cv-integrity.ai",
            'password_hash': password_hash,
            'salt': salt,
            'provider': provider,  # local, google, github
            'created_at': datetime.now().isoformat(),
            'last_login': None,
            'active': True,
            'avatar': username[0].upper(),
            'role': 'viewer'  # Default role
        }
        
        self._save(self.users_file, self.users)
        
        return {
            'status': 'success',
            'message': 'User registered successfully',
            'user': {
                'username': username,
                'email': self.users[username]['email'],
                'role': 'viewer'
            }
        }
    
    # ============================================================
    # LOGIN
    # ============================================================
    
    def login(self, username, password):
        """Login user and create session"""
        if username not in self.users:
            return {'status': 'error', 'message': 'Invalid credentials'}
        
        user = self.users[username]
        
        if not user.get('active'):
            return {'status': 'error', 'message': 'Account is deactivated'}
        
        # Verify password
        stored_hash = user['password_hash']
        salt = user['salt']
        password_hash, _ = self._hash_password(password, salt)
        
        if password_hash != stored_hash:
            return {'status': 'error', 'message': 'Invalid credentials'}
        
        # Create session
        session_token = self._generate_token()
        session_data = {
            'username': username,
            'token': session_token,
            'created_at': datetime.now().isoformat(),
            'expires_at': (datetime.now() + timedelta(hours=self.session_expiry_hours)).isoformat(),
            'ip_address': 'localhost',
            'user_agent': 'CV-INTEGRITY-Dashboard'
        }
        
        self.sessions[session_token] = session_data
        self._save(self.sessions_file, self.sessions)
        
        # Update last login
        self.users[username]['last_login'] = datetime.now().isoformat()
        self._save(self.users_file, self.users)
        
        return {
            'status': 'success',
            'message': 'Login successful',
            'session_token': session_token,
            'user': {
                'username': username,
                'email': user['email'],
                'role': user.get('role', 'viewer'),
                'avatar': user.get('avatar', username[0].upper())
            }
        }
    
    # ============================================================
    # OAUTH SIMULATION
    # ============================================================
    
    def oauth_login(self, provider, email=None, name=None):
        """
        Simulate OAuth login (Google/GitHub)
        In production, this would handle real OAuth flow
        """
        if provider not in ['google', 'github']:
            return {'status': 'error', 'message': 'Invalid provider'}
        
        # Generate username from email or name
        if email:
            username = email.split('@')[0]
        elif name:
            username = name.lower().replace(' ', '_')
        else:
            username = f"{provider}_user_{secrets.token_hex(4)}"
        
        # Create user if doesn't exist
        if username not in self.users:
            self.users[username] = {
                'username': username,
                'email': email or f"{username}@{provider}.com",
                'password_hash': None,
                'salt': None,
                'provider': provider,
                'created_at': datetime.now().isoformat(),
                'last_login': datetime.now().isoformat(),
                'active': True,
                'avatar': username[0].upper(),
                'role': 'contributor'
            }
            self._save(self.users_file, self.users)
        
        # Create session
        session_token = self._generate_token()
        session_data = {
            'username': username,
            'token': session_token,
            'provider': provider,
            'created_at': datetime.now().isoformat(),
            'expires_at': (datetime.now() + timedelta(hours=self.session_expiry_hours)).isoformat()
        }
        
        self.sessions[session_token] = session_data
        self._save(self.sessions_file, self.sessions)
        
        return {
            'status': 'success',
            'message': f'Logged in via {provider}',
            'session_token': session_token,
            'user': {
                'username': username,
                'email': self.users[username]['email'],
                'role': self.users[username].get('role', 'contributor'),
                'avatar': username[0].upper(),
                'provider': provider
            }
        }
    
    # ============================================================
    # SESSION MANAGEMENT
    # ============================================================
    
    def verify_session(self, session_token):
        """Verify if session is valid"""
        if session_token not in self.sessions:
            return {'valid': False, 'message': 'Session not found'}
        
        session = self.sessions[session_token]
        expires_at = datetime.fromisoformat(session['expires_at'])
        
        if datetime.now() > expires_at:
            # Session expired
            del self.sessions[session_token]
            self._save(self.sessions_file, self.sessions)
            return {'valid': False, 'message': 'Session expired'}
        
        username = session['username']
        user = self.users.get(username, {})
        
        return {
            'valid': True,
            'username': username,
            'user': {
                'username': username,
                'email': user.get('email'),
                'role': user.get('role', 'viewer'),
                'avatar': user.get('avatar', username[0].upper())
            }
        }
    
    def logout(self, session_token):
        """Logout user"""
        if session_token in self.sessions:
            del self.sessions[session_token]
            self._save(self.sessions_file, self.sessions)
            return {'status': 'success', 'message': 'Logged out'}
        
        return {'status': 'error', 'message': 'Session not found'}
    
    def get_active_sessions(self):
        """Get all active sessions"""
        active = []
        expired = []
        
        for token, session in self.sessions.items():
            expires_at = datetime.fromisoformat(session['expires_at'])
            if datetime.now() > expires_at:
                expired.append(token)
            else:
                active.append(session)
        
        # Clean expired
        for token in expired:
            del self.sessions[token]
        if expired:
            self._save(self.sessions_file, self.sessions)
        
        return active
    
    # ============================================================
    # TOKEN MANAGEMENT
    # ============================================================
    
    def create_api_token(self, username, name='API Token'):
        """Create API token for user"""
        token = self._generate_token()
        
        self.tokens[token] = {
            'token': token,
            'username': username,
            'name': name,
            'created_at': datetime.now().isoformat(),
            'last_used': None,
            'active': True
        }
        
        self._save(self.tokens_file, self.tokens)
        
        return token
    
    def verify_api_token(self, token):
        """Verify API token"""
        if token not in self.tokens:
            return {'valid': False, 'message': 'Invalid token'}
        
        token_data = self.tokens[token]
        
        if not token_data.get('active'):
            return {'valid': False, 'message': 'Token deactivated'}
        
        # Update last used
        self.tokens[token]['last_used'] = datetime.now().isoformat()
        self._save(self.tokens_file, self.tokens)
        
        return {
            'valid': True,
            'username': token_data['username']
        }
    
    def get_stats(self):
        """Get auth statistics"""
        return {
            'total_users': len(self.users),
            'active_users': len([u for u in self.users.values() if u.get('active')]),
            'active_sessions': len(self.get_active_sessions()),
            'total_tokens': len(self.tokens)
        }


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🔐 AUTHENTICATION MANAGER DEMO")
    print("="*60 + "\n")
    
    auth = AuthManager()
    
    # ============================================================
    # TEST 1: Registration
    # ============================================================
    print("📝 Test 1: User Registration")
    print("-" * 40)
    
    result = auth.register('testuser', 'password123', 'test@example.com')
    if result['status'] == 'success':
        print(f"   ✅ {result['message']}")
        print(f"   Username: {result['user']['username']}")
    else:
        print(f"   ⚠️  {result['message']}")
    
    # ============================================================
    # TEST 2: Login
    # ============================================================
    print("\n🔐 Test 2: Login")
    print("-" * 40)
    
    result = auth.login('testuser', 'password123')
    if result['status'] == 'success':
        print(f"   ✅ {result['message']}")
        print(f"   Token: {result['session_token'][:30]}...")
        session_token = result['session_token']
    else:
        print(f"   ❌ {result['message']}")
        session_token = None
    
    # Wrong password
    result = auth.login('testuser', 'wrongpass')
    print(f"   ❌ Wrong password: {result['message']}")
    
    # ============================================================
    # TEST 3: Session Verification
    # ============================================================
    print("\n✅ Test 3: Session Verification")
    print("-" * 40)
    
    if session_token:
        result = auth.verify_session(session_token)
        if result['valid']:
            print(f"   ✅ Session valid: {result['username']}")
            print(f"   Role: {result['user']['role']}")
    
    # ============================================================
    # TEST 4: OAuth Login
    # ============================================================
    print("\n🌐 Test 4: OAuth Login (Simulated)")
    print("-" * 40)
    
    result = auth.oauth_login('google', 'oauth@example.com', 'OAuth User')
    if result['status'] == 'success':
        print(f"   ✅ {result['message']}")
        print(f"   Username: {result['user']['username']}")
        print(f"   Provider: {result['user']['provider']}")
    
    # ============================================================
    # TEST 5: API Token
    # ============================================================
    print("\n🔑 Test 5: API Token")
    print("-" * 40)
    
    api_token = auth.create_api_token('testuser', 'Dashboard API')
    print(f"   ✅ API Token created")
    print(f"   Token: {api_token[:30]}...")
    
    # Verify token
    result = auth.verify_api_token(api_token)
    if result['valid']:
        print(f"   ✅ Token valid for: {result['username']}")
    
    # ============================================================
    # TEST 6: Logout
    # ============================================================
    print("\n🚪 Test 6: Logout")
    print("-" * 40)
    
    if session_token:
        result = auth.logout(session_token)
        print(f"   ✅ {result['message']}")
        
        # Verify session is invalid now
        result = auth.verify_session(session_token)
        print(f"   ✅ Session invalidated: {result['message']}")
    
    # ============================================================
    # STATS
    # ============================================================
    print("\n" + "="*60)
    print("📊 AUTH STATISTICS")
    print("="*60)
    
    stats = auth.get_stats()
    for key, value in stats.items():
        print(f"   {key.replace('_', ' ').title()}: {value}")
    
    print("\n" + "="*60)
    print("✅ Authentication Manager ready!")
    print("="*60)