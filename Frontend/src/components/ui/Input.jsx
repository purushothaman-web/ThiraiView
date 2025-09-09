import React from "react";

export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 shadow-sm ${className}`}
      {...props}
    />
  );
}

export function Label({ children, className = "" }) {
  return (
    <label className={`block text-sm mb-2 font-medium text-gray-900 dark:text-gray-100 ${className}`}>
      {children}
    </label>
  );
}


