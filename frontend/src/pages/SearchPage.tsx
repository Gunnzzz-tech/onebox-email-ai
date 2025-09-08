import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { searchEmails, getAccounts } from '../services/api';
import { Email, SearchParams, Account } from '../types/email';
import EmailCard from '../components/EmailCard';
import SearchBar from '../components/SearchBar';
import Filters from '../components/Filters';

const SearchPage: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadAccounts();
    
    // Check for query in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const urlQuery = urlParams.get('q');
    if (urlQuery) {
      setQuery(urlQuery);
      performSearch(urlQuery);
    }
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await getAccounts();
      setAccounts(response.accounts);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  };

  const performSearch = async (searchQuery: string, page = 0) => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const params: SearchParams = {
        query: searchQuery,
        account: selectedAccount || undefined,
        page,
        size: 20
      };

      const response = await searchEmails(params);
      setEmails(response.emails);
      setTotalPages(response.totalPages);
      setTotalResults(response.total);
      setCurrentPage(page);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setCurrentPage(0);
    performSearch(searchQuery, 0);
    
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('q', searchQuery);
    window.history.pushState({}, '', url.toString());
  };

  const handlePageChange = (page: number) => {
    performSearch(query, page);
  };

  const clearFilters = () => {
    setSelectedAccount('');
    setQuery('');
    setEmails([]);
    setTotalPages(0);
    setTotalResults(0);
    setCurrentPage(0);
    
    // Clear URL
    window.history.pushState({}, '', '/search');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Search Emails</h1>
          <p className="text-gray-600">Find emails across all your accounts</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-lg shadow">
        <SearchBar onSearch={handleSearch} initialValue={query} />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button
              onClick={clearFilters}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <X className="h-4 w-4 mr-1" />
              Clear all
            </button>
          </div>
          <Filters
            accounts={accounts}
            selectedAccount={selectedAccount}
            onAccountChange={setSelectedAccount}
          />
        </div>
      )}

      {/* Search Results */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {loading ? 'Searching...' : `Search Results (${totalResults.toLocaleString()})`}
            </h3>
            {query && (
              <div className="text-sm text-gray-600">
                Page {currentPage + 1} of {totalPages}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : emails.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>{query ? 'No emails found matching your search' : 'Enter a search query to find emails'}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {emails.map((email) => (
              <EmailCard key={email._id} email={email} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex space-x-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + Math.max(0, currentPage - 2);
                  if (page >= totalPages) return null;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
