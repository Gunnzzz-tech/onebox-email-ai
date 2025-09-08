import React from 'react';
import { X } from 'lucide-react';
import { Account } from '../types/email';

interface FiltersProps {
  accounts: Account[];
  selectedAccount: string;
  onAccountChange: (account: string) => void;
  onClear?: () => void;
}

const Filters: React.FC<FiltersProps> = ({ 
  accounts, 
  selectedAccount, 
  onAccountChange,
  onClear 
}) => {
  const categories = [
    'Interested',
    'Meeting Booked', 
    'Not Interested',
    'Spam',
    'Out of Office'
  ];

  const hasActiveFilters = selectedAccount !== '';

  return (
    <div className="space-y-4">
      {/* Account Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Account
        </label>
        <select
          value={selectedAccount}
          onChange={(e) => onAccountChange(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">All Accounts</option>
          {accounts.map((account) => (
            <option key={account.name} value={account.name}>
              {account.name} ({account.count} emails)
            </option>
          ))}
        </select>
      </div>

      {/* Quick Category Filters */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Category Filters
        </label>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                // This would typically trigger a search with category filter
                console.log(`Filter by category: ${category}`);
              }}
              className="px-3 py-2 text-sm text-left text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Date Range Filters */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Date
          </label>
          <input
            type="date"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => {
              if (e.target.value) {
                console.log(`Filter from: ${e.target.value}`);
              }
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To Date
          </label>
          <input
            type="date"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => {
              if (e.target.value) {
                console.log(`Filter to: ${e.target.value}`);
              }
            }}
          />
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Active Filters</span>
            {onClear && (
              <button
                onClick={onClear}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedAccount && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Account: {selectedAccount}
                <button
                  onClick={() => onAccountChange('')}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;
