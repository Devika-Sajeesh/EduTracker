import { useState } from "react";
// Change ONLY to verify path issue
import { getCachedStudyTips } from "../../services/aiAssistant.js";
import { useAuth } from "../../contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import "./AIStudyAssistant.css";

export default function AIStudyAssistant({ subject = "General Studies" }) {
  const { currentUser } = useAuth();
  const [tips, setTips] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTips = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await getCachedStudyTips(
        subject,
        currentUser?.uid || "anonymous"
      );
      setTips(result);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to fetch tips"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-assistant">
      <div className="ai-header">
        <h3>AI Study Tips for {subject}</h3>
        <button
          onClick={fetchTips}
          disabled={isLoading}
          className={`ai-button ${isLoading ? "loading" : ""}`}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Generating...
            </>
          ) : (
            "Get AI Study Tips"
          )}
        </button>
      </div>

      {error && (
        <div className="ai-error">
          {error}
          <button onClick={fetchTips}>Try Again</button>
        </div>
      )}

      {tips && (
        <div className="ai-tips">
          <h4>Suggested Study Strategies:</h4>
          <ReactMarkdown
            components={{
              p: ({ node, ...props }) => (
                <p className="markdown-content" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="markdown-content" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="markdown-content" {...props} />
              ),
            }}
          >
            {tips}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
