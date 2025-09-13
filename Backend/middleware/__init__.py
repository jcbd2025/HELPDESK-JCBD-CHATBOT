from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
import os
import logging
from dotenv import load_dotenv
from .auth import require_api_key, require_jwt_auth

__all__ = ['require_api_key', 'require_jwt_auth']
# Cargar variables de entorno
load_dotenv()

# Inicializar extensiones
db = SQLAlchemy()
jwt = JWTManager()
cors = CORS()

def create_app():
    app = Flask(__name__)
    
    # Configuración
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['CHATBOT_API_KEY'] = os.getenv('CHATBOT_API_KEY')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql://root:@localhost/help_desk_jcbd')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Inicializar extensiones con la app
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)
    
    # Configurar logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    # Registrar blueprints
    register_blueprints(app, logger)
    
    # Crear tablas
    with app.app_context():
        try:
            db.create_all()
            logger.info("✅ Tablas de la base de datos creadas correctamente")
        except Exception as e:
            logger.error(f"❌ Error creando tablas: {e}")
    
    return app

def register_blueprints(app, logger):
    """Registrar todos los blueprints con manejo de errores"""
    blueprints = [
        ('auth_bp', 'routes.auth', 'auth_bp', '/auth'),
        ('panel_bp', 'routes.panel', 'panel_bp', '/panel'),
        ('usuarios_bp', 'routes.usuarios', 'usuarios_bp', '/usuarios'),
        ('categorias_bp', 'routes.categorias', 'categorias_bp', '/categorias'),
        ('grupos_bp', 'routes.grupos', 'grupos_bp', '/grupos'),
        ('entidades_bp', 'routes.entidades', 'entidades_bp', '/entidades'),
        ('tickets_bp', 'routes.tickets', 'tickets_bp', '/api/tickets'),
        ('whatsapp_bp', 'routes.whatsapp', 'whatsapp_bp', '/api/whatsapp'),
        ('chatbot_bp', 'routes.chatbot', 'chatbot_bp', '/api/chatbot')
    ]
    
    for bp_name, module, bp_var, url_prefix in blueprints:
        try:
            module_obj = __import__(module, fromlist=[bp_var])
            bp = getattr(module_obj, bp_var)
            app.register_blueprint(bp, url_prefix=url_prefix)
            logger.info(f"✅ Blueprint {bp_name} registrado correctamente")
        except ImportError as e:
            logger.warning(f"⚠️ No se pudo importar {bp_name}: {e}")
        except Exception as e:
            logger.error(f"❌ Error registrando {bp_name}: {e}")