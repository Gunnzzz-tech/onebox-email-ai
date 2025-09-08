import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Mail, Search, BarChart3, Settings, Bell } from 'lucide-react';
import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import Analytics from './pages/Analytics';
import SettingsPage from './pages/SettingsPage';
import NotificationCenter from './components/NotificationCenter';
import { checkHealth, subscribeToEvents } from './services/api';

function App() {
  const [isOnline, setIsOnline] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const health = await checkHealth();
        setIsOnline(health.elasticsearch === 'connected');
      } catch (error) {
        setIsOnline(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    const unsubscribe = subscribeToEvents((evt) => {
      setNotifications(prev => [{
        id: `${Date.now()}`,
        type: 'success',
        title: 'New Interested Email',
        message: `${evt.subject} — ${evt.sender}`,
        timestamp: new Date()
      }, ...prev.slice(0, 9)]);
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const addNotification = (notification: any) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-blue-600" />
                <h1 className="ml-2 text-xl font-bold text-gray-900">
                  OneBox Email Analyzer
                </h1>
                <div className="ml-4 flex items-center">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="ml-2 text-sm text-gray-600">
                    {isOnline ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900"
                >
                  <Bell className="h-6 w-6" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <a
                href="/"
                className="flex items-center px-1 pt-1 pb-4 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-gray-300"
              >
                <Mail className="h-4 w-4 mr-2" />
                Dashboard
              </a>
              <a
                href="/search"
                className="flex items-center px-1 pt-1 pb-4 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </a>
              <a
                href="/analytics"
                className="flex items-center px-1 pt-1 pb-4 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </a>
              <a
                href="/settings"
                className="flex items-center px-1 pt-1 pb-4 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </a>

            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home addNotification={addNotification} />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>

        {/* Notification Center */}
        {showNotifications && (
          <NotificationCenter
            notifications={notifications}
            onClose={() => setShowNotifications(false)}
            onClear={() => setNotifications([])}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
