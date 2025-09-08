import React, { useState } from "react";
import axios from "axios";

const SuggestedReply: React.FC = () => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);

  const getSuggestion = async () => {
    if (!subject || !body) {
      alert("Please enter subject and body");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/suggest-reply", {
        subject,
        body,
      });
      setSuggestion(response.data.suggestion || "No suggestion found.");
    } catch (error) {
      console.error("Error fetching suggestion:", error);
      setSuggestion("❌ Failed to generate suggestion.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">✉️ AI Suggested Reply</h2>

      <input
        type="text"
        placeholder="Email Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />

      <textarea
        placeholder="Email Body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={5}
        className="w-full mb-3 p-2 border rounded"
      />

      <button
        onClick={getSuggestion}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? "Generating..." : "Get Suggested Reply"}
      </button>

      {suggestion && (
        <div className="mt-4 p-3 border rounded bg-gray-50">
          <h3 className="font-medium mb-2">AI Suggestion:</h3>
          <p>{suggestion}</p>
        </div>
      )}
    </div>
  );
};

export default SuggestedReply;
