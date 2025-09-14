from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
import os
import logging
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Inicializar extensiones
db = SQLAlchemy()
jwt = JWTManager()
cors = CORS()

def create_app():
    app = Flask(__name__)
    
    # Configuración
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallback-secret-key')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', os.getenv('SECRET_KEY', 'fallback-jwt-secret-key'))
    app.config['CHATBOT_API_KEY'] = os.getenv('CHATBOT_API_KEY', '')
    
    # Configuración de MySQL - corregida
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        # Construir la URL de conexión a MySQL si no está definida
        db_user = os.getenv('DB_USER', 'root')
        db_password = os.getenv('DB_PASSWORD', '')
        db_host = os.getenv('DB_HOST', 'localhost')
        db_port = os.getenv('DB_PORT', '3306')
        db_name = os.getenv('DB_NAME', 'help_desk_jcbd')
        
        database_url = f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_recycle': 300,
        'pool_pre_ping': True,
    }
    
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
            # Verificar si el error es por falta de conexión a la base de datos
            if "Unknown database" in str(e):
                logger.error("⚠️ La base de datos no existe. Crea la base de datos MySQL primero.")
            elif "Access denied" in str(e):
                logger.error("⚠️ Error de acceso. Verifica las credenciales de la base de datos.")
    
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
            logger.warning(f"⚠️ No se pudo importar {module}: {e}")
        except AttributeError as e:
            logger.error(f"❌ No se encontró el blueprint {bp_var} en {module}: {e}")
        except Exception as e:
            logger.error(f"❌ Error registrando {bp_name}: {e}")

# Importar los decoradores de autenticación después de crear las extensiones
from .auth import require_api_key, require_jwt_auth
__all__ = ['require_api_key', 'require_jwt_auth']