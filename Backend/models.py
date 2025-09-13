from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Ticket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), default='abierto')
    priority = db.Column(db.String(50), default='media')
    source = db.Column(db.String(50))  # web, whatsapp, chatbot
    customer_phone = db.Column(db.String(20))
    customer_email = db.Column(db.String(100))
    customer_id = db.Column(db.String(100))  # Para identificar usuario entre sistemas
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'source': self.source,
            'customer_phone': self.customer_phone,
            'customer_email': self.customer_email,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }