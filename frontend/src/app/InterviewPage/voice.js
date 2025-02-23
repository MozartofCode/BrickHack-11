"use client";
import { useEffect } from 'react';

const VoiceInput = ({ onConversationUpdate, onCompleted }) => {
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in your browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      sendToBackend(speechToText);
    };

    recognition.onerror = (error) => {
      console.error('Speech recognition error:', error);
    };

    recognition.start();
  }, []);

  const sendToBackend = async (text) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await response.json();

      // Speak the AI response.
      speakText(data.reply);

      // Update conversation history in InterviewPage.
      if (onConversationUpdate) {
        onConversationUpdate(text, data.reply);
      }
      // Signal that this exchange is complete.
      if (onCompleted) {
        onCompleted();
      }
    } catch (error) {
      console.error('Error communicating with the backend:', error);
    }
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return null; // No UI from this component.
};

export default VoiceInput;
