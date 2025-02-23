"use client";
import React from "react";

function MainComponent() {
  const [score] = useState(8);
  const [feedback] = useState(
    "You demonstrated strong communication skills and provided detailed responses. Consider providing more specific examples in your answers and practicing common behavioral questions."
  );
  const [performanceMetrics] = useState({
    communication: 85,
    content: 75,
    confidence: 90,
  });

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
            strokeDasharray={`${(2 * Math.PI * 36 * value) / 100} ${
              2 * Math.PI * 36
            }`}
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
      <style jsx global>{`
        @keyframes celebrate {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }

        .confetti-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confetti 3s ease-out infinite;
        }

        .celebrate-text {
          animation: celebrate 1s ease-out forwards;
        }

        .emoji-bounce {
          display: inline-block;
          animation: bounce 1s ease infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <div className="max-w-2xl mx-auto relative">
        <div className="confetti-container">
          {[...Array.from({ length: 20 })].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: ["#FF8C00", "#FFB347", "#FFCB73"][
                  Math.floor(Math.random() * 3)
                ],
              }}
            />
          ))}
        </div>

        <h1 className="text-4xl font-inter font-bold text-gray-900 dark:text-white mb-8 pb-2 border-b-4 border-[#FF8C00] text-center celebrate-text">
          Congratulations!
          <span className="emoji-bounce ml-2">🎉</span>
          <br />
          <span className="text-2xl mt-2 block">Interview Complete!</span>
        </h1>

        <div className="flex justify-center mb-12">
          <div className="w-48 h-48 rounded-full border-8 border-[#FF8C00] flex items-center justify-center bg-gray-50 dark:bg-black">
            <span className="text-6xl font-inter font-bold text-gray-900 dark:text-white">
              {score}/10
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <CircleProgress
            value={performanceMetrics.communication}
            label="Communication"
          />
          <CircleProgress value={performanceMetrics.content} label="Content" />
          <CircleProgress
            value={performanceMetrics.confidence}
            label="Confidence"
          />
        </div>

        <div className="bg-gray-50 dark:bg-black p-6 rounded-lg border-2 border-[#FF8C00] hover:bg-[#FFF3E6] dark:hover:bg-gray-900 transition-all duration-200 mb-8">
          <h2 className="text-2xl font-inter font-bold text-gray-900 dark:text-white mb-4">
            Interview Feedback
          </h2>
          <p className="text-gray-700 dark:text-gray-300 font-inter">
            {feedback}
          </p>
        </div>

        <a
          href="/ai-interviewing"
          className="block w-full bg-[#FF8C00] text-white text-center px-6 py-3 rounded hover:bg-[#E67A00] transition-colors font-inter"
        >
          Start New Interview
        </a>
      </div>
    </div>
  );
}

export default MainComponent;