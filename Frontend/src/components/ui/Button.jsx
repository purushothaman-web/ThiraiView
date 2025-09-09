import React from "react";

const base =
  "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

const variants = {
  primary:
    "bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500/50 shadow-sm",
  secondary:
    "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 focus:ring-2 focus:ring-blue-500/50 shadow-sm",
  ghost:
    "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-2 focus:ring-blue-500/50",
  danger:
    "bg-red-600 hover:bg-red-700 text-white focus:ring-2 focus:ring-red-500/50 shadow-sm",
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  as = "button",
  ...props
}) {
  const Component = as;
  
  return (
    <Component className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Component>
  );
}


