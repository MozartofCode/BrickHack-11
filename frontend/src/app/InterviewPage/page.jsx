"use client";
import React from "react";
import { useState, useEffect } from "react";


function InterviewPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/interview-sessions");
        if (!response.ok) {
          throw new Error("Failed to load session");
        }
        const data = await response.json();
        setSessionData(data);
        setTotalQuestions(data.questionCount || 3);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        console.error(err);
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const handleInterviewerClick = () => {
    if (!isLoading && sessionData) {
      setCurrentQuestion((curr) => curr + 1);
    }
  };
  const handleFinish = () => {
    window.location.href = "/interview-results";
  };
  const sectionMarkers = Array.from(
    { length: totalQuestions - 1 },
    (_, i) => (i + 1) * (100 / totalQuestions)
  );

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <div className="max-w-4xl mx-auto">
        <div
          onClick={handleInterviewerClick}
          className={`bg-gray-50 dark:bg-black p-8 rounded-lg border-2 border-[#FF8C00] mb-6 transition-all duration-200 
            ${
              !isLoading && sessionData
                ? "hover:bg-[#FFF3E6] dark:hover:bg-gray-900 cursor-pointer"
                : ""
            }`}
        >
          <div className="h-[400px] flex items-center justify-center">
            {isLoading ? (
              <div className="animate-spin text-4xl">⏳</div>
            ) : (
              <span className="text-gray-700 dark:text-gray-300 text-xl font-inter">
                {currentQuestion === 0
                  ? "Click to start the interview"
                  : "AI Interviewer Area"}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative">
            <div
              className="bg-[#FF8C00] h-4 rounded-full transition-all duration-300"
              style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
            />
            {sectionMarkers.map((position, index) => (
              <div
                key={index}
                className="absolute top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"
                style={{ left: `${position}%` }}
              />
            ))}
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleFinish}
              disabled={currentQuestion === 0}
              className="w-full sm:w-auto bg-[#FF8C00] text-white px-6 py-3 rounded hover:bg-[#E67A00] transition-colors disabled:opacity-50"
            >
              Finish Interview
            </button>
          </div>

          <div className="text-center text-gray-700 dark:text-gray-300 font-inter">
            Question {currentQuestion} of {totalQuestions}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewPage;