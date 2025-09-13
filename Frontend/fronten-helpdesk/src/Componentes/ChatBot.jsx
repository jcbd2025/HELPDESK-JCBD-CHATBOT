// src/components/Chatbot.jsx
import React, { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";
import styles from "../styles/ChatBot.module.css";
import ChatbotIcon from "../imagenes/img chatbot.png";


const ChatBot = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hola 👋, soy tu asistente virtual. ¿En qué puedo ayudarte?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  // Desplazar siempre al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = { sender: "user", text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    try {
      const response = await axios.post("http://localhost:5005/webhooks/rest/webhook", {
        sender: "user", // ID de sesión
        message: inputValue
      });

      if (response.data && response.data.length > 0) {
        response.data.forEach((msg) => {
          setMessages((prev) => [...prev, { sender: "bot", text: msg.text }]);
        });
      } else {
        setMessages((prev) => [...prev, { sender: "bot", text: "Lo siento, no entendí tu mensaje." }]);
      }
    } catch (error) {
      console.error("Error al conectar con el chatbot:", error);
      setMessages((prev) => [...prev, { sender: "bot", text: "Ocurrió un error al conectarme con el servidor." }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className={styles.chatbotContainer}>
      <img
        src={ChatbotIcon}
        alt="Chatbot"
        className={styles.chatbotIcon}
        onClick={toggleChat}
      />
      {isChatOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <h4>Chat de Soporte</h4>
            <button onClick={toggleChat} className={styles.closeChat}>
              &times;
            </button>
          </div>
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
