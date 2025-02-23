"use client";
import { useState, useEffect } from 'react';

const VoiceInput = () => {
  const [transcript, setTranscript] = useState('');
  const [reply, setReply] = useState('');

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
      setTranscript(speechToText);
      // Send text to backend after capturing speech
      sendToBackend(speechToText);
    };

    recognition.onerror = (error) => {
      console.error('Speech recognition error:', error);
    };

    // Start listening when the component mounts or on user action.
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

      // Use text-to-speech to speak the response
      speakText(data.reply);
      // Save the backend reply in state so it can be rendered
      setReply(data.reply);
      
    } catch (error) {
      console.error('Error communicating with the backend:', error);
    }
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div>
      <p>You said: {transcript}</p>
      <p>Response: {reply}</p>
    </div>
  );
};

export default VoiceInput;
