"use client";
import { React, useState, useCallback } from "react";
import { useRouter } from "next/navigation"; // Import Next.js router

function SurveyPage() {
  const router = useRouter(); // Initialize the router
  const [formData, setFormData] = useState({
    desiredJob: "",
    questionCount: 3,
    difficulty: "easy",
    company: "",
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = useCallback((e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError(null);
      setIsSubmitting(true);

      try {
        // Create a FormData instance
        const formDataToSend = new FormData();
        // Append all text fields
        formDataToSend.append("desiredJob", formData.desiredJob);
        formDataToSend.append("questionCount", formData.questionCount);
        formDataToSend.append("difficulty", formData.difficulty);
        formDataToSend.append("company", formData.company);

        // Append the resume file if available
        if (file) {
          formDataToSend.append("resume", file);
        }

        // Make the request; let the browser set the Content-Type header automatically
        const response = await fetch("http://127.0.0.1:5000/store_user_info", {
          method: "POST",
          body: formDataToSend,
        });

        if (!response.ok) {
          throw new Error("Failed to create Interview session!");
        }

        setSuccess(true);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [file, formData]
  );

  if (success) {
    return (
      <div className="min-h-screen bg-white dark:bg-black p-6 flex items-center justify-center">
        <div className="bg-gray-50 dark:bg-black p-8 rounded-lg max-w-md w-full text-center border-2 border-[#FF8C00]">
          <div className="text-[#FF8C00] text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-inter font-bold text-gray-900 dark:text-white mb-4">
            Interview Session Created!
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Your interview session has been successfully set up.
          </p>
          <button
            onClick={() => router.push("/InterviewPage")} // Navigate to InterviewPage
            className="w-full bg-[#FF8C00] text-white px-6 py-2 rounded hover:bg-[#E67A00] transition-colors"
          >
            Navigate to Interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-inter font-bold text-gray-900 dark:text-white mb-8 pb-2 border-b-4 border-[#FF8C00]">
          AI Interview Preparation
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 dark:bg-black p-6 rounded-lg border-2 border-[#FF8C00] hover:bg-[#FFF3E6] dark:hover:bg-gray-900 transition-all duration-200">
            <div className="mb-6">
              <label className="block text-gray-900 dark:text-white font-inter mb-2">
                Upload Your Resume (Optional)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded text-gray-700 dark:text-gray-300"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-900 dark:text-white font-inter mb-2">
                What job are you looking for?
              </label>
              <input
                type="text"
                name="desiredJob"
                value={formData.desiredJob}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded text-gray-700 dark:text-gray-300"
                placeholder="e.g. Software Engineer"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-900 dark:text-white font-inter mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                name="questionCount"
                min="1"
                max="5"
                value={formData.questionCount}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded text-gray-700 dark:text-gray-300"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-900 dark:text-white font-inter mb-2">
                Difficulty Level
              </label>
              <div className="space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="difficulty"
                    value="easy"
                    checked={formData.difficulty === "easy"}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Easy</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="difficulty"
                    value="hard"
                    checked={formData.difficulty === "hard"}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Hard</span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-900 dark:text-white font-inter mb-2">
                Select Company
              </label>
              <select
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded text-gray-700 dark:text-gray-300"
              >
                <option value="">Select a company</option>
                <option value="Apple">Apple</option>
                <option value="Google">Google</option>
                <option value="Hilton">Hilton</option>
                <option value="Southwest Airlines">Southwest Airlines</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#FF8C00] text-white px-6 py-3 rounded hover:bg-[#E67A00] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⏳</span>
                Processing...
              </span>
            ) : (
              "Start Interview Preparation"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SurveyPage;
