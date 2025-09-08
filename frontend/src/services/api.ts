import axios from 'axios';
import { SearchParams, SearchResponse, EmailStats, Account } from '../types/email';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Health check
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Search emails
export const searchEmails = async (params: SearchParams): Promise<SearchResponse> => {
  const response = await api.post('/emails/search', params);
  return response.data;
};

// Get email by ID
export const getEmail = async (id: string) => {
  const response = await api.get(`/emails/${id}`);
  return response.data;
};

// Get email statistics
export const getEmailStats = async (account?: string): Promise<EmailStats> => {
  const response = await api.get('/emails/stats', {
    params: account ? { account } : {}
  });
  return response.data;
};

// Get recent emails
export const getRecentEmails = async (limit = 10, account?: string, fromDate?: string, toDate?: string) => {
  const response = await api.get('/emails/recent', {
    params: { limit, account, fromDate, toDate }
  });
  return response.data;
};

// Get accounts
export const getAccounts = async (): Promise<{ accounts: Account[] }> => {
  const response = await api.get('/accounts');
  return response.data;
};

// AI Replies API functions
export const getAIReplySuggestion = async (emailData: {
  subject: string;
  body: string;
  from: string;
  to: string;
  category: string;
}) => {
  const response = await api.post('/ai-replies/suggest-reply', emailData);
  return response.data;
};

export const getAIReplyTemplates = async () => {
  const response = await api.get('/ai-replies/templates');
  return response.data;
};

export const checkAIRepliesHealth = async () => {
  const response = await api.get('/ai-replies/health');
  return response.data;
};

export default api;

// SSE client for new email events
export const subscribeToEvents = (onNewEmail: (data: any) => void) => {
  const es = new EventSource('/api/events');
  es.addEventListener('new-email', (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      onNewEmail(data);
    } catch (e) {
      console.error('Failed to parse event data', e);
    }
  });
  es.onerror = () => {
    es.close();
  };
  return () => es.close();
};
