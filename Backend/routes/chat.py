from flask import Blueprint, request, jsonify
import requests
from routes.tickets import crear_ticket   # Importa tu función para crear tickets

chat_bp = Blueprint("chat", __name__)

# URL de Rasa (asegúrate de que Rasa corre en ese puerto)
RASA_URL = "http://localhost:5005/webhooks/rest/webhook"


@chat_bp.route("/", methods=["POST"])
@chat_bp.route("", methods=["POST"])
def chat():
    try:
        # 🔹 Leer datos del frontend
        data = request.json or {}
        sender = data.get("sender", "user")
        message = data.get("message", "")

        if not message.strip():
            return jsonify({"messages": ["⚠️ No se recibió ningún mensaje válido."]}), 400

        # 🔹 1. Enviar mensaje a Rasa
        rasa_response = requests.post(
            RASA_URL, json={"sender": sender, "message": message}
        )
        rasa_responses = rasa_response.json()

        final_messages = []

        # 🔹 2. Procesar respuestas de Rasa
        for msg in rasa_responses:
            # Texto normal del bot
            if "text" in msg:
                final_messages.append(msg["text"])

            # ⚡ Manejo de intención personalizada: "crear_ticket"
            intent = msg.get("intent", {}).get("name")
            if intent == "crear_ticket":
                ticket_data = {
                    "descripcion": message,
                    "prioridad": "media",
                    "categoria": "1",
                    "nombre": sender,
                    "correo": "correo@desconocido.com"
                }
                ticket_response = crear_ticket(ticket_data)

                if "error" in ticket_response:
                    final_messages.append("⚠️ Ocurrió un error al crear el ticket.")
                else:
                    final_messages.append(ticket_response["message"])

        # 🔹 3. Respuesta final al frontend
        if not final_messages:
            final_messages.append("Lo siento, no entendí tu mensaje.")

        return jsonify({"messages": final_messages})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

