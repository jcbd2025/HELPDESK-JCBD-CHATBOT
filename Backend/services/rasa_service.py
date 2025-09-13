import requests
import json
from ..models import db, Ticket, Message

class RasaService:
    def __init__(self):
        self.rasa_url = os.getenv('RASA_SERVER_URL', 'http://localhost:5005')
    
    def process_message(self, message, user_id):
        # Send message to Rasa
        payload = {
            "sender": user_id,
            "message": message
        }
        
        try:
            response = requests.post(
                f"{self.rasa_url}/webhooks/rest/webhook",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return [{"text": "Lo siento, el chatbot no está disponible en este momento."}]
        
        except requests.exceptions.RequestException:
            return [{"text": "Error de conexión con el servicio de chatbot."}]
    
    def create_ticket_from_chatbot(self, user_data, message):
        ticket = Ticket(
            title=f"Ticket desde Chatbot - {user_data.get('email', 'Usuario')}",
            description=message,
            source='chatbot',
            customer_email=user_data.get('email'),
            customer_phone=user_data.get('phone'),
            status='abierto'
        )
        
        db.session.add(ticket)
        db.session.commit()
        
        # Save initial message
        msg = Message(
            ticket_id=ticket.id,
            content=message,
            sender='customer'
        )
        db.session.add(msg)
        db.session.commit()
        
        return ticket.id