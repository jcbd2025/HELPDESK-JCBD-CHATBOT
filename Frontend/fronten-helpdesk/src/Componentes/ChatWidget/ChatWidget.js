import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatWidget.css';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const messagesEndRef = useRef(null);

    // Generar o recuperar sessionId
    useEffect(() => {
        let id = localStorage.getItem('chatbot_session_id');
        if (!id) {
            id = 'web-' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('chatbot_session_id', id);
        }
        setSessionId(id);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const sendMessage = async () => {
        if (!inputMessage.trim() || !sessionId) return;

        const userMessage = { text: inputMessage, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');

        try {
            // Enviar mensaje al chatbot Rasa externo
            const response = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
                sender: sessionId,
                message: inputMessage
            });

            // Procesar respuesta del chatbot
            response.data.forEach(botMessage => {
                setMessages(prev => [...prev, { 
                    text: botMessage.text, 
                    sender: 'bot' 
                }]);
            });

        } catch (error) {
            console.error('Error communicating with chatbot:', error);
            setMessages(prev => [...prev, { 
                text: 'Lo siento, no puedo conectar con el servicio en este momento. Por favor intenta más tarde.', 
                sender: 'bot' 
            }]);
        }
    };

    return (
        <div className="chat-widget">
            {isOpen && (
                <div className="chat-container">
                    <div className="chat-header">
                        <h4>Asistente Virtual</h4>
                        <button onClick={() => setIsOpen(false)}>×</button>
                    </div>
                    
                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Escribe tu mensaje..."
                        />
                        <button onClick={sendMessage}>Enviar</button>
                    </div>
                </div>
            )}

            <button 
                className="chat-button"
                onClick={() => setIsOpen(!isOpen)}
            >
                🤖 Asistente
            </button>
        </div>
    );
};

export default ChatWidget;