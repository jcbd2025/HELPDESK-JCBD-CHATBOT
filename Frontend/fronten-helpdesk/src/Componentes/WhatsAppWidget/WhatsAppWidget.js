import React, { useState } from 'react';
import axios from 'axios';
import './WhatsAppWidget.css';

const WhatsAppWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');

    const sendMessage = async () => {
        try {
            const response = await axios.post('/api/whatsapp/send', {
                to: '+1234567890', // Número del cliente
                message: message
            });
            
            if (response.data.success) {
                alert('Mensaje enviado por WhatsApp');
                setMessage('');
                setIsOpen(false);
            }
        } catch (error) {
            console.error('Error sending WhatsApp message:', error);
        }
    };

    return (
        <div className="whatsapp-widget">
            {isOpen && (
                <div className="whatsapp-chat">
                    <div className="chat-header">
                        <h4>Soporte por WhatsApp</h4>
                        <button onClick={() => setIsOpen(false)}>×</button>
                    </div>
                    <div className="chat-body">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Escribe tu mensaje..."
                        />
                        <button onClick={sendMessage}>Enviar</button>
                    </div>
                </div>
            )}
            
            <button 
                className="whatsapp-button"
                onClick={() => setIsOpen(!isOpen)}
            >
                💬 WhatsApp
            </button>
        </div>
    );
};

export default WhatsAppWidget;