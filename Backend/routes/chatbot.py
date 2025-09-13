from flask import Blueprint, request, jsonify
from middleware.auth import require_api_key
from models import db, Ticket

chatbot_bp = Blueprint('chatbot', __name__)

@chatbot_bp.route('/create_ticket', methods=['POST'])
@require_api_key
def create_ticket_from_chatbot():
    try:
        data = request.get_json()
        
        if not data or not data.get('description'):
            return jsonify({'error': 'La descripción es requerida'}), 400
        
        # Crear nuevo ticket
        ticket = Ticket(
            title=data.get('title', 'Ticket desde Chatbot'),
            description=data['description'],
            source='chatbot',
            customer_phone=data.get('customer_phone'),
            customer_email=data.get('customer_email'),
            customer_id=data.get('customer_id'),
            status='abierto',
            priority=data.get('priority', 'media')
        )
        
        db.session.add(ticket)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'ticket_id': ticket.id,
            'message': 'Ticket creado exitosamente'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@chatbot_bp.route('/tickets/<customer_id>', methods=['GET'])
@require_api_key
def get_customer_tickets(customer_id):
    try:
        tickets = Ticket.query.filter_by(customer_id=customer_id).order_by(
            Ticket.created_at.desc()
        ).all()
        
        return jsonify({
            'success': True,
            'tickets': [ticket.to_dict() for ticket in tickets]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500