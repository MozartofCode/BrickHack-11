"use client";
import React, { useState, useEffect } from "react";

function FeedbackPage() {
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the feedback and scores from the backend on component mount
  useEffect(() => {
    async function fetchFeedback() {
      try {
        const res = await fetch("http://127.0.0.1:5000/get_feedback");
        const data = await res.json();
        setFeedbackData(data);
      } catch (error) {
        console.error("Error fetching feedback data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFeedback();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black p-6 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!feedbackData) {
    return (
      <div className="min-h-screen bg-white dark:bg-black p-6 flex items-center justify-center">
        Error loading feedback.
      </div>
    );
  }

  const { communication, content, confidence, feedback } = feedbackData;

  // Reusable component to render a circular progress indicator
  const CircleProgress = ({ value, label }) => (
    <div className="bg-gray-50 dark:bg-black p-4 rounded-lg border-2 border-[#FF8C00]">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        {label}
      </h3>
      <div className="relative h-24 flex items-center justify-center">
        <svg className="transform -rotate-90 w-20 h-20">
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="#FFE5CC"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="#FF8C00"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${(2 * Math.PI * 36 * value) / 100} ${2 *
              Math.PI *
              36}`}
          />
        </svg>
        <span className="absolute text-gray-900 dark:text-white font-bold">
          {value}%
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Interview Feedback
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <CircleProgress value={communication} label="Communication" />
          <CircleProgress value={content} label="Content" />
          <CircleProgress value={confidence} label="Confidence" />
        </div>

        <div className="bg-gray-50 dark:bg-black p-6 rounded-lg border-2 border-[#FF8C00]">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Detailed Feedback
          </h2>
          <p className="text-gray-700 dark:text-gray-300">{feedback}</p>
        </div>
      </div>
    </div>
  );
}

export default FeedbackPage;
