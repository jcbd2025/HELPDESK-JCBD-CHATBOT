import os
import requests
from twilio.rest import Client
from models import db, Ticket

class WhatsAppService:
    def __init__(self):
        # Configuración para Twilio
        self.account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        self.auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        self.whatsapp_number = os.getenv('TWILIO_WHATSAPP_NUMBER')
        self.client = Client(self.account_sid, self.auth_token) if self.account_sid and self.auth_token else None

    def process_message(self, from_number, message_body):
        """
        Processa mensajes entrantes de WhatsApp y crea/actualiza tickets
        """
        # Buscar ticket abierto existente para este número
        ticket = Ticket.query.filter_by(
            customer_phone=from_number,
            status='abierto'
        ).first()

        if not ticket:
            # Crear nuevo ticket
            ticket = Ticket(
                title=f"Ticket desde WhatsApp - {from_number}",
                description=message_body,
                source='whatsapp',
                customer_phone=from_number,
                status='abierto'
            )
            db.session.add(ticket)
            db.session.commit()
            
            return "✅ Hola! He creado un ticket para tu consulta. Un agente te contactará pronto."

        else:
            # Actualizar ticket existente
            ticket.description += f"\n[Cliente vía WhatsApp]: {message_body}"
            db.session.commit()
            
            return "✅ Mensaje recibido y agregado a tu ticket existente."

    def send_message(self, to_number, message):
        """
        Envía mensaje a través de WhatsApp
        """
        if not self.client:
            return {'success': False, 'error': 'WhatsApp service not configured'}

        try:
            message = self.client.messages.create(
                body=message,
                from_=f'whatsapp:{self.whatsapp_number}',
                to=f'whatsapp:{to_number}'
            )
            return {'success': True, 'message_id': message.sid}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def validate_twilio_request(self, request):
        """
        Valida que la solicitud viene de Twilio
        """
        # Por ahora retornamos True para testing
        # Implementar validación real con firma Twilio
        return True