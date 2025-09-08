import React from 'react';
import { Email } from '../types/email';
import EmailCard from './EmailCard';

interface EmailListProps {
  emails: Email[];
  loading?: boolean;
  emptyMessage?: string;
}

const EmailList: React.FC<EmailListProps> = ({ 
  emails, 
  loading = false, 
  emptyMessage = 'No emails found' 
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</h3>
        <p className="text-gray-500">Try adjusting your search criteria or filters</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {emails.map((email) => (
        <EmailCard key={email._id} email={email} />
      ))}
    </div>
  );
};

export default EmailList;
