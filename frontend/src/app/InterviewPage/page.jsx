"use client";
import React, { useState, useEffect } from "react";
import VoiceInput from "./voice"; // Adjust the path as needed

function InterviewPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [error, setError] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const userSessionId = localStorage.getItem("userSessionId");
    console.log("🧐 Checking userSessionId in localStorage:", userSessionId);

    if (!userSessionId) {
      setError("User session not found. Please complete the survey first.");
      console.error("❌ User session not found in localStorage!");
      return;
    }

    const loadSession = async () => {
      try {
        setIsLoading(true);
        console.log("📡 Fetching session from backend with userSessionId:", userSessionId);

        const response = await fetch(
          `http://127.0.0.1:5000/create_interviewer?userSessionId=${encodeURIComponent(userSessionId)}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to load session: ${errorText}`);
        }

        const data = await response.json();
        console.log("📩 Received session data:", data);

        setSessionData(data);
        setTotalQuestions(data.questionCount || 3);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        console.error("❌ Error loading session:", err);
        setIsLoading(false);
      }
    };

    loadSession();

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    } else {
      loadVoices();
    }
  }, []);

  const handleInterviewerClick = () => {
    if (!isLoading && sessionData) {
      if (currentQuestion < totalQuestions) {
        setCurrentQuestion((curr) => curr + 1);
        setShowVoiceInput(true);
      } else {
        handleFinish();
      }
    }
  };

  const handleConversationUpdate = async (userText, aiText) => {
    const userSessionId = localStorage.getItem("userSessionId");

    console.log("🚀 Sending data to backend:", { message: userText, userSessionId });

    if (!userSessionId) {
      console.error("❌ userSessionId is missing in localStorage!");
      alert("Error: userSessionId is missing. Please restart the process.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          userSessionId,
        }),
      });

      const data = await response.json();
      console.log("📩 Received response from backend:", data);

      if (data.error) {
        console.error("❌ Backend returned an error:", data.error);
        setError(data.error);
      } else {
        const updatedConversation = [...conversation, { user: userText, ai: data.reply }];
        setConversation(updatedConversation);

        speakText(data.reply);
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);
      setError("Failed to send message.");
    }
  };

  const handleVoiceCompleted = () => {
    setShowVoiceInput(false);
  };

  const storeInterview = async () => {
    const userSessionId = localStorage.getItem("userSessionId");

    console.log("📤 Sending interview to backend:", { userSessionId, conversation });

    if (!userSessionId) {
      console.error("❌ Cannot store interview: userSessionId missing!");
      alert("Error: userSessionId is missing. Please restart.");
      return;
    }

    const payload = {
      conversation,
      userSessionId,
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/store_interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("✅ Interview stored:", result);

      if (result.error) {
        console.error("❌ Backend returned an error:", result.error);
        setError(result.error);
      }
    } catch (error) {
      console.error("❌ Error storing interview:", error);
      setError("Failed to store interview.");
    }
  };

  const handleFinish = async () => {
    await storeInterview();
    console.log("✅ Interview stored! Redirecting to FeedbackPage...");
    window.location.href = "/FeedbackPage";
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) {
      console.error("Speech synthesis not supported.");
      return;
    }

    window.speechSynthesis.cancel(); 

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    const voice = voices.find((v) => v.name.includes("Google US English")) || voices[0];
    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <div className="max-w-4xl mx-auto">
        <div
          onClick={handleInterviewerClick}
          className={`bg-gray-50 dark:bg-black p-8 rounded-lg border-2 border-[#FF8C00] mb-6 transition-all duration-200 
            ${!isLoading && sessionData ? "hover:bg-[#FFF3E6] dark:hover:bg-gray-900 cursor-pointer" : ""}`}
        >
          <div className="h-[400px] flex flex-col justify-between">
            <div className="flex justify-center">
              <img src="/interviewer.jpg" alt="Interviewer" className="max-h-60 object-contain" />
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative mb-2">
              <div className="bg-[#FF8C00] h-4 rounded-full transition-all duration-300"
                style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }} />
            </div>

            <div className="h-32 overflow-y-auto p-2 bg-gray-100 dark:bg-gray-800 rounded">
              {conversation.length > 0 ? (
                conversation.map((item, idx) => (
                  <div key={idx} className="mb-2">
                    <div className="text-sm text-blue-600">You: {item.user}</div>
                    <div className="text-sm text-green-600">AI: {item.ai}</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-700 dark:text-gray-300 text-xl font-inter">
                  {currentQuestion === 0 ? "Click here to start the interview" : `Question ${currentQuestion} of ${totalQuestions}`}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <button onClick={handleFinish} className="bg-[#FF8C00] text-white px-6 py-3 rounded hover:bg-[#E67A00] transition">
            Finish Interview
          </button>
        </div>

        {showVoiceInput && <VoiceInput onConversationUpdate={handleConversationUpdate} onCompleted={handleVoiceCompleted} />}
      </div>
    </div>
  );
}

export default InterviewPage;
