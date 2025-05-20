import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="text-center max-w-[90%] sm:max-w-md">
        <h1 className="text-6xl sm:text-7xl font-bold mb-3 sm:mb-4 text-gray-900">404</h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-4 sm:mb-6">Oops! Page not found</p>
        <a 
          href="/" 
          className="inline-block text-blue-500 hover:text-blue-700 underline text-base sm:text-lg transition-colors duration-200"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
