from flask import Flask, request, jsonify
from flask_cors import CORS
from routes.auth import auth_bp
from routes.panel import panel_bp
from routes.usuarios import usuarios_bp
from routes.categorias import categorias_bp
from routes.grupos import grupos_bp
from routes.entidades import entidades_bp
from routes.chatbot import chatbot_bp
from routes.whatsapp import whatsapp_bp
from routes.tickets import tickets_bp
from routes.chat import chat_bp



app = Flask(__name__)
CORS(app)
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(panel_bp, url_prefix="/panel") 
app.register_blueprint(usuarios_bp, url_prefix="/usuarios")
app.register_blueprint(categorias_bp, url_prefix="/categorias")
app.register_blueprint(grupos_bp, url_prefix="/grupos")
app.register_blueprint(entidades_bp, url_prefix="/entidades")
app.register_blueprint(chatbot_bp, url_prefix="/chatbot")
app.register_blueprint(whatsapp_bp, url_prefix="/whatsapp")
app.register_blueprint(tickets_bp, url_prefix="/api/tickets")
app.register_blueprint(chat_bp, url_prefix="/api/chat")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)



