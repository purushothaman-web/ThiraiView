import React from "react";
import { useNavigate } from "react-router-dom";

const MovieCard = ({ id, title, director, year, avgRating, poster }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/movies/${id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer border rounded-lg p-4 shadow hover:shadow-md transition"
    >
      {poster ? (
        <img
          src={`http://localhost:3000${poster}`}
          alt={`${title} poster`}
          className="w-full h-48 object-cover mb-4 rounded"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 mb-4 flex items-center justify-center text-gray-400">
          No poster available
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600">Director: {director}</p>
      <p className="text-gray-500">Year: {year}</p>
      <p className="text-yellow-600 font-medium">
        ⭐ {avgRating?.toFixed(1) ?? "No ratings yet"}
      </p>
    </div>
  );
};

export default MovieCard;
