// src/components/ChatBot.jsx
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import styles from "../styles/ChatBot.module.css";
import ChatbotIcon from "../imagenes/img chatbot.png";

const ChatBot = () => {
  // Estados
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hola 👋, soy tu asistente virtual. ¿En qué puedo ayudarte?" }
  ]);
  const [inputValue, setInputValue] = useState("");

  // Referencia para auto-scroll
  const messagesEndRef = useRef(null);

  // Efecto: siempre baja al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Abrir/cerrar chat
  const toggleChat = () => setIsChatOpen((prev) => !prev);

  // Enviar mensaje al backend
  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    // Guardar mensaje del usuario
    const userMessage = { sender: "user", text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    try {
      // 🔹 Petición a Flask (no directo a Rasa)
      const response = await axios.post("http://localhost:8000/api/chat", {
        sender: "user", // ID de sesión
        message: inputValue
      });

      // Procesar respuesta del backend
      if (response.data && response.data.messages) {
        response.data.messages.forEach((msg) => {
          setMessages((prev) => [...prev, { sender: "bot", text: msg }]);
        });
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Lo siento, no entendí tu mensaje." }
        ]);
      }
    } catch (error) {
      console.error("Error al conectar con el chatbot:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Ocurrió un error al conectarme con el servidor." }
      ]);
    }
  };

  // Enviar con Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className={styles.chatbotContainer}>
      {/* Icono flotante para abrir/cerrar chat */}
      <img
        src={ChatbotIcon}
        alt="Chatbot"
        className={styles.chatbotIcon}
        onClick={toggleChat}
      />

      {isChatOpen && (
        <div className={styles.chatWindow}>
          {/* Header del chat */}
          <div className={styles.chatHeader}>
            <h4>Chat de Soporte</h4>
            <button onClick={toggleChat} className={styles.closeChat}>
              &times;
            </button>
          </div>

          {/* Cuerpo del chat */}
          <div className={styles.chatBody}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={msg.sender === "user" ? styles.userMessage : styles.botMessage}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de usuario */}
          <div className={styles.chatInput}>
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={sendMessage}>Enviar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
