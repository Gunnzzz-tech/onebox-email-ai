import React, { useState } from 'react';
import { Bot, Copy, RefreshCw, Check, AlertCircle, Sparkles } from 'lucide-react';
import { getAIReplySuggestion } from '../services/api';
import { Email, AIReplyResponse } from '../types/email';

interface AIReplyProps {
  email: Email;
  onReplyGenerated?: (reply: string) => void;
}

const AIReply: React.FC<AIReplyProps> = ({ email, onReplyGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [aiReply, setAiReply] = useState<AIReplyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateReply = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const emailData = {
        subject: email._source.subject || '',
        body: email._source.text || '',
        from: email._source.from || '',
        to: email._source.to || '',
        category: email._source.category || ''
      };

      const response = await getAIReplySuggestion(emailData);
      setAiReply(response);
      
      if (onReplyGenerated) {
        onReplyGenerated(response.suggestedReply);
      }
    } catch (err) {
      console.error('Failed to generate AI reply:', err);
      setError('Failed to generate AI reply. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (aiReply?.suggestedReply) {
      try {
        await navigator.clipboard.writeText(aiReply.suggestedReply);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  const regenerateReply = () => {
    setAiReply(null);
    generateReply();
  };

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Bot className="h-4 w-4 text-blue-600" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900">AI Reply Suggestion</h4>
          <Sparkles className="h-4 w-4 text-blue-500" />
        </div>
        
        {!aiReply && !isLoading && (
          <button
            onClick={generateReply}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <Bot className="h-3 w-3" />
            <span>Generate Reply</span>
          </button>
        )}
        
        {aiReply && !isLoading && (
          <button
            onClick={regenerateReply}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded-md hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Regenerate</span>
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-gray-600">Generating AI reply...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {aiReply && (
        <div className="space-y-3">
          {/* Confidence and Template Info */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Confidence: {Math.round(aiReply.confidence * 100)}%</span>
              </span>
              <span>Template: {aiReply.template}</span>
            </div>
          </div>

          {/* Suggested Reply */}
          <div className="bg-white rounded-md border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-medium text-gray-900">Suggested Reply</h5>
              <button
                onClick={copyToClipboard}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {aiReply.suggestedReply}
            </div>
          </div>

          {/* Reasoning */}
          {aiReply.reasoning && (
            <div className="bg-gray-50 rounded-md p-3">
              <h6 className="text-xs font-medium text-gray-700 mb-1">AI Reasoning</h6>
              <p className="text-xs text-gray-600 leading-relaxed">
                {aiReply.reasoning}
              </p>
            </div>
          )}
        </div>
      )}

      {!aiReply && !isLoading && !error && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600 mb-3">
            Get AI-powered reply suggestions based on the email content and context.
          </p>
          <div className="text-xs text-gray-500">
            <p>• Analyzes email category: <span className="font-medium">{email._source.category}</span></p>
            <p>• Considers sender and subject context</p>
            <p>• Uses professional templates and best practices</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIReply;
