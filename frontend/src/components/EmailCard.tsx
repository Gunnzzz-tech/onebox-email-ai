import React, { useState } from 'react';
import { Mail, Calendar, User, Tag, Paperclip, ChevronDown, ChevronUp, Bot } from 'lucide-react';
import { Email } from '../types/email';
import { format } from 'date-fns';
import AIReply from './AIReply';

interface EmailCardProps {
  email: Email;
}

const EmailCard: React.FC<EmailCardProps> = ({ email }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAIReply, setShowAIReply] = useState(false);
  const { _source: emailData } = email;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Interested': return 'bg-green-100 text-green-800 border-green-200';
      case 'Meeting Booked': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Not Interested': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Spam': return 'bg-red-100 text-red-800 border-red-200';
      case 'Out of Office': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {emailData.from}
                </p>
                <span className="text-xs text-gray-500">→</span>
                <p className="text-sm text-gray-600 truncate">
                  {emailData.to}
                </p>
              </div>
              <p className="text-sm text-gray-900 font-medium mt-1">
                {emailData.subject || 'No Subject'}
              </p>
            </div>
          </div>

          {/* Category and Account */}
          <div className="flex items-center space-x-2 mb-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(emailData.category)}`}>
              <Tag className="h-3 w-3 mr-1" />
              {emailData.category}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {emailData.account}
            </span>
            {emailData.attachments && emailData.attachments.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <Paperclip className="h-3 w-3 mr-1" />
                {emailData.attachments.length} attachment{emailData.attachments.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Preview Text */}
          <p className="text-sm text-gray-600 mb-3">
            {isExpanded ? emailData.text : truncateText(emailData.text || '', 200)}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(emailData.date)}
              </div>
              <div className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                {emailData.account}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAIReply(!showAIReply)}
                className="flex items-center text-purple-600 hover:text-purple-800"
              >
                <Bot className="h-3 w-3 mr-1" />
                {showAIReply ? 'Hide AI Reply' : 'AI Reply'}
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Show more
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Reply Section */}
          {showAIReply && (
            <AIReply email={email} />
          )}

          {/* Attachments */}
          {isExpanded && emailData.attachments && emailData.attachments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments</h4>
              <div className="space-y-2">
                {emailData.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <Paperclip className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{attachment.filename}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailCard;
