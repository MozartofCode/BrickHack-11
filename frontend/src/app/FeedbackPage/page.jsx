"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter

function FeedbackPage() {
  const router = useRouter();
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFeedback() {
      const userSessionId = localStorage.getItem("userSessionId");
      if (!userSessionId) {
        console.error("No user session ID found.");
        setError("User session ID missing.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `http://127.0.0.1:5000/get_feedback?userSessionId=${encodeURIComponent(userSessionId)}`
        );

        if (!res.ok) {
          throw new Error(`Error ${res.status}: Failed to fetch feedback`);
        }

        const data = await res.json();

        if (!data.communication || !data.content || !data.confidence || !data.feedback) {
          throw new Error("Incomplete feedback data received from the server.");
        }

        setFeedbackData(data);
      } catch (error) {
        console.error("Error fetching feedback data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchFeedback();
  }, []);

  const handleGoBack = () => {
    router.push("/"); // Navigate to home page
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  if (!feedbackData) {
    return <div className="min-h-screen flex items-center justify-center">Error loading feedback.</div>;
  }

  const { communication = 0, content = 0, confidence = 0, feedback = "No feedback available." } = feedbackData;

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Interview Feedback</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <CircleProgress value={communication} label="Communication" />
          <CircleProgress value={content} label="Content" />
          <CircleProgress value={confidence} label="Confidence" />
        </div>

        <div className="bg-gray-50 dark:bg-black p-6 rounded-lg border-2 border-[#FF8C00]">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Detailed Feedback</h2>
          <p className="text-gray-700 dark:text-gray-300">{feedback}</p>
        </div>

        {/* 🔥 Back to Home Button */}
        <div className="flex justify-center mt-6">
          <button 
            onClick={handleGoBack} 
            className="bg-[#FF8C00] text-white px-6 py-3 rounded hover:bg-[#E67A00] transition">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

// Reusable Progress Circle Component
const CircleProgress = ({ value, label }) => (
  <div className="bg-gray-50 dark:bg-black p-4 rounded-lg border-2 border-[#FF8C00]">
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{label}</h3>
    <div className="relative h-24 flex items-center justify-center">
      <svg className="transform -rotate-90 w-20 h-20">
        <circle cx="40" cy="40" r="36" stroke="#FFE5CC" strokeWidth="8" fill="none" />
        <circle
          cx="40"
          cy="40"
          r="36"
          stroke="#FF8C00"
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${(2 * Math.PI * 36 * value) / 100} ${2 * Math.PI * 36}`}
        />
      </svg>
      <span className="absolute text-gray-900 dark:text-white font-bold">{value}%</span>
    </div>
  </div>
);

export default FeedbackPage;
