import React from "react";

export default function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
    primary: "bg-blue-600 dark:bg-blue-500 text-white",
    secondary: "bg-gray-600 dark:bg-gray-500 text-white",
    success: "bg-green-600 dark:bg-green-500 text-white",
    warning: "bg-yellow-600 dark:bg-yellow-500 text-white",
    danger: "bg-red-600 dark:bg-red-500 text-white",
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}


