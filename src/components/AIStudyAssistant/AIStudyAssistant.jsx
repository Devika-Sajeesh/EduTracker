import { useState } from "react";
import { getCachedDoubtClarification } from "../../services/aiAssistant.js";
import { useAuth } from "../../contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import "./AIStudyAssistant.css";

export default function AIStudyAssistant() {
  const { currentUser } = useAuth();
  const [doubt, setDoubt] = useState("");
  const [clarification, setClarification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClarification = async () => {
    if (!doubt.trim()) {
      setError("Please enter your doubt.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await getCachedDoubtClarification(
        doubt.trim(),
        currentUser?.uid || "anonymous"
      );
      setClarification(result);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to fetch clarification"
      );
      setClarification(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-assistant">
      <div className="ai-header">
        <h3>AI Doubt Clarifier</h3>
        <textarea
          placeholder="Type your doubt here..."
          value={doubt}
          onChange={(e) => setDoubt(e.target.value)}
          rows={3}
          className="doubt-input"
          disabled={isLoading}
        />
        <button
          onClick={fetchClarification}
          disabled={isLoading}
          className={`ai-button ${isLoading ? "loading" : ""}`}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Clarifying...
            </>
          ) : (
            "Get Clarification"
          )}
        </button>
      </div>

      {error && (
        <div className="ai-error">
          {error}
          <button onClick={fetchClarification}>Try Again</button>
        </div>
      )}

      {clarification && (
        <div className="ai-clarification">
          <h4>Clarification:</h4>
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
            {clarification}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
