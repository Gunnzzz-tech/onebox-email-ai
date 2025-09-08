import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Users, Mail } from 'lucide-react';
import { getEmailStats, getAccounts } from '../services/api';
import { EmailStats, Account } from '../types/email';

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [selectedAccount]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [statsResponse, accountsResponse] = await Promise.all([
        getEmailStats(selectedAccount || undefined),
        getAccounts()
      ]);
      setStats(statsResponse);
      setAccounts(accountsResponse.accounts);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Interested': return 'bg-green-500';
      case 'Meeting Booked': return 'bg-blue-500';
      case 'Not Interested': return 'bg-gray-500';
      case 'Spam': return 'bg-red-500';
      case 'Out of Office': return 'bg-yellow-500';
      default: return 'bg-gray-500';
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
          <h1 className="text-2xl font-bold text-gray-900">Email Analytics</h1>
          <p className="text-gray-600">Insights and trends from your email data</p>
        </div>
        
        {/* Account Filter */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Account:</label>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Accounts</option>
            {accounts.map((account) => (
              <option key={account.name} value={account.name}>
                {account.name} ({account.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {stats && (
        <>
          {/* Overview Cards */}
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
                  <p className="text-sm font-medium text-gray-600">Active Accounts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.byAccount.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.byDate
                      .filter(d => {
                        const date = new Date(d.key_as_string);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return date >= weekAgo;
                      })
                      .reduce((sum, d) => sum + d.doc_count, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Email Categories</h3>
            <div className="space-y-4">
              {stats.byCategory.map((category) => {
                const percentage = (category.doc_count / stats.totalEmails) * 100;
                return (
                  <div key={category.key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full ${getCategoryColor(category.key)} mr-3`}></div>
                        <span className="text-sm font-medium text-gray-900">{category.key}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {category.doc_count} ({percentage.toFixed(1)}%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getCategoryColor(category.key)}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Account Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Emails by Account</h3>
            <div className="space-y-4">
              {stats.byAccount.map((account) => {
                const percentage = (account.doc_count / stats.totalEmails) * 100;
                return (
                  <div key={account.key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{account.key}</span>
                      <div className="text-sm text-gray-600">
                        {account.doc_count} ({percentage.toFixed(1)}%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Activity */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Daily Activity (Last 30 Days)</h3>
            <div className="space-y-2">
              {stats.byDate.slice(-30).map((day) => (
                <div key={day.key_as_string} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">
                    {new Date(day.key_as_string).toLocaleDateString()}
                  </span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{ 
                          width: `${Math.min(100, (day.doc_count / Math.max(...stats.byDate.map(d => d.doc_count))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {day.doc_count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
