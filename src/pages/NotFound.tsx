import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import ThemeContext from '../context/ThemeContext';

const NotFound: React.FC = () => {
  const { darkMode } = useContext(ThemeContext);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-2xl font-semibold mb-6">Page Not Found</p>
      <p className={`mb-8 max-w-md ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link
        to="/"
        className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <Home size={18} className="mr-2" />
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;