from flask import Blueprint, request, jsonify
from twilio.twiml.messaging_response import MessagingResponse
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

whatsapp_bp = Blueprint('whatsapp', __name__)

# Importar servicio después de crear blueprint para evitar dependencias circulares
try:
    from services.whatsapp_service import WhatsAppService
    whatsapp_service = WhatsAppService()
except ImportError as e:
    logger.error(f"No se pudo importar WhatsAppService: {e}")
    whatsapp_service = None

@whatsapp_bp.route('/webhook', methods=['POST'])
def whatsapp_webhook():
    if not whatsapp_service:
        return jsonify({'error': 'WhatsApp service not configured'}), 500
        
    try:
        # Validar que viene de Twilio
        if not whatsapp_service.validate_twilio_request(request):
            return jsonify({'error': 'Invalid request'}), 403
            
        incoming_msg = request.values.get('Body', '').lower()
        from_number = request.values.get('From', '')
        
        # Procesar mensaje
        response = whatsapp_service.process_message(from_number, incoming_msg)
        
        twilio_response = MessagingResponse()
        twilio_response.message(response)
        return str(twilio_response)
        
    except Exception as e:
        logger.error(f"WhatsApp webhook error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@whatsapp_bp.route('/send', methods=['POST'])
def send_whatsapp():
    """
    Endpoint para enviar mensajes por WhatsApp
    """
    if not whatsapp_service:
        return jsonify({'error': 'WhatsApp service not configured'}), 500
        
    try:
        data = request.json
        
        if not data.get('to') or not data.get('message'):
            return jsonify({'error': 'Número destino y mensaje son requeridos'}), 400
        
        result = whatsapp_service.send_message(data['to'], data['message'])
        
        if result['success']:
            return jsonify({'success': True, 'message_id': result['message_id']})
        else:
            return jsonify({'error': result['error']}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500