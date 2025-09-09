import React from "react";

export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className = "" }) {
  return <div className={`p-4 md:p-6 ${className}`}>{children}</div>;
}

export function CardHeader({ title, subtitle, right, className = "" }) {
  return (
    <div className={`p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between ${className}`}>
      <div>
        {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>}
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  );
}


