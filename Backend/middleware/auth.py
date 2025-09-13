from functools import wraps
from flask import request, jsonify
import os

def require_api_key(f):
    """
    Middleware para autenticación por API Key
    Usado para las llamadas del chatbot externo
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        expected_key = os.getenv('CHATBOT_API_KEY', 'default-chatbot-key')
        
        if not api_key or api_key != expected_key:
            return jsonify({'error': 'Unauthorized', 'message': 'API Key inválida'}), 401
        
        return f(*args, **kwargs)
    return decorated_function

def require_jwt_auth(f):
    """
    Middleware para autenticación JWT (si ya lo tienes)
    Puedes adaptarlo según tu sistema actual de autenticación
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Aquí implementarías tu lógica actual de autenticación JWT
        # Por ejemplo:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token requerido'}), 401
        
        token = auth_header.split(' ')[1]
        # Validar token JWT aquí...
        
        return f(*args, **kwargs)
    return decorated_function