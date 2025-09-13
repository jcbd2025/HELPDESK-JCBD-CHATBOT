import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración de la base de datos
DATABASE_CONFIG = {
  'host': 'localhost',
    'database': 'help_desk_jcbd',  
    'user': 'root',            
    'password': "",
    'port': 3306,
    'autocommit': False,
    'charset': 'utf8mb4'
}

