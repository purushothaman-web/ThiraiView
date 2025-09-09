import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function NotFound() {
  const location = useLocation();
  return (
  <div className="min-h-[60vh] flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
  <div className="text-center max-w-lg bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <h1 className="text-5xl font-extrabold mb-2 text-gray-900 dark:text-gray-100">404</h1>
        <p className="text-xl mb-4 text-gray-800 dark:text-gray-200">We couldn't find that page.</p>
        <p className="text-gray-500 dark:text-gray-400 mb-6 break-all">{location.pathname}</p>
        <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium">
          Go Home
        </Link>
      </div>
    </div>
  );
}


