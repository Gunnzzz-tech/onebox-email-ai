import React, { useState, useEffect } from 'react';
import { Mail, TrendingUp, Users, Clock, AlertCircle } from 'lucide-react';
import { getRecentEmails, getEmailStats, getAccounts, subscribeToEvents } from '../services/api';
import { Email, EmailStats, Account } from '../types/email';
import EmailCard from '../components/EmailCard';
import SearchBar from '../components/SearchBar';
import Filters from '../components/Filters';

interface HomeProps {
  addNotification: (notification: any) => void;
}

const Home: React.FC<HomeProps> = ({ addNotification }) => {
  const [recentEmails, setRecentEmails] = useState<Email[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, [selectedAccount]);

  useEffect(() => {
    const unsubscribe = subscribeToEvents(() => {
      // Refresh dashboard on any new email
      loadDashboardData();
    });
    return () => unsubscribe();
  }, [selectedAccount]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [emailsResponse, statsResponse, accountsResponse] = await Promise.all([
        getRecentEmails(50, selectedAccount || undefined), // Show more emails by default
        getEmailStats(selectedAccount || undefined),
        getAccounts()
      ]);

      setRecentEmails(emailsResponse.emails);
      setStats(statsResponse);
      setAccounts(accountsResponse.accounts);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      addNotification({
        type: 'error',
        title: 'Failed to load data',
        message: 'Could not fetch dashboard information'
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Interested': return 'bg-green-100 text-green-800';
      case 'Meeting Booked': return 'bg-blue-100 text-blue-800';
      case 'Not Interested': return 'bg-gray-100 text-gray-800';
      case 'Spam': return 'bg-red-100 text-red-800';
      case 'Out of Office': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Dashboard</h1>
          <p className="text-gray-600">Monitor and analyze your emails across multiple accounts</p>
        </div>
        <div className="flex space-x-4">
          <SearchBar onSearch={(query) => window.location.href = `/search?q=${encodeURIComponent(query)}`} />
        </div>
      </div>

      {/* Account Filter */}
      <Filters
        accounts={accounts}
        selectedAccount={selectedAccount}
        onAccountChange={setSelectedAccount}
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Emails</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEmails.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Interested</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.byCategory.find(c => c.key === 'Interested')?.doc_count || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accounts</p>
                <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Emails</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.byDate.find(d => d.key_as_string === new Date().toISOString().split('T')[0])?.doc_count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {stats && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.byCategory.map((category) => (
              <div key={category.key} className="text-center">
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(category.key)}`}>
                  {category.key}
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">{category.doc_count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Emails */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedAccount ? `Emails from ${selectedAccount}` : 'All Emails'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {selectedAccount ? `Showing emails from ${selectedAccount}` : 'Showing emails from all accounts'}
          </p>
        </div>
        <div className="divide-y divide-gray-200">
          {recentEmails.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No emails found</p>
            </div>
          ) : (
            recentEmails.map((email) => (
              <EmailCard key={email._id} email={email} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
