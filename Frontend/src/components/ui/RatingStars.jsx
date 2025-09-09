import React from "react";

export default function RatingStars({ value = 0, outOf = 5, className = "" }) {
  const stars = Array.from({ length: outOf });
  return (
    <div className={`flex items-center ${className}`} aria-label={`Rating ${value} out of ${outOf}`}>
      {stars.map((_, i) => {
        const filled = i < Math.round(value);
        return (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill={filled ? "#facc15" : "#3f3f46"}
            className="h-4 w-4 mr-0.5"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10.5 13.347a1 1 0 00-1.175 0l-2.935 2.136c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.755 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.294-3.292z" />
          </svg>
        );
      })}
    </div>
  );
}


