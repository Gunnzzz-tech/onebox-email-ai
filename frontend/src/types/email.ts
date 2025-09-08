export interface Email {
  _id: string;
  _source: {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
    date: string;
    messageId: string;
    account: string;
    labels: string[];
    category: string;
    attachments: Attachment[];
  };
}

export interface Attachment {
  filename: string;
  contentType: string;
  size: number;
}

export interface SearchParams {
  query: string;
  account?: string;
  page?: number;
  size?: number;
}

export interface SearchResponse {
  emails: Email[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface EmailStats {
  totalEmails: number;
  byCategory: Array<{
    key: string;
    doc_count: number;
  }>;
  byAccount: Array<{
    key: string;
    doc_count: number;
  }>;
  byDate: Array<{
    key_as_string: string;
    doc_count: number;
  }>;
}

export interface Account {
  name: string;
  count: number;
}

// AI Replies types
export interface AIReplyRequest {
  subject: string;
  body: string;
  from: string;
  to: string;
  category: string;
}

export interface AIReplyResponse {
  suggestedReply: string;
  template: string;
  confidence: number;
  reasoning: string;
}

export interface AIReplyTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  variables: string[];
}
