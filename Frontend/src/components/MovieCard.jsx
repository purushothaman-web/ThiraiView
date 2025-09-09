import React from "react";
import { useNavigate } from "react-router-dom";
import Card, { CardBody } from "./ui/Card";
import Badge from "./ui/Badge";
import RatingStars from "./ui/RatingStars";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const MovieCard = ({ id, title, director, year, avgRating, poster, medium }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/movies/${id}`);
  };

  const posterSrc = poster?.startsWith("http") ? poster : `${BASE_URL}${poster ?? ""}`;

  return (
    <Card className="cursor-pointer overflow-hidden" onClick={handleClick}>
      <div className={`relative aspect-[2/3] w-full bg-white/5 dark:bg-gray-900/40 ${medium ? 'max-h-64 md:max-h-72' : 'max-h-56 md:max-h-64'}`}>
        {poster ? (
          <img
            src={posterSrc}
            alt={`${title} poster`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-zinc-500">No poster</div>
        )}
        {typeof avgRating === "number" && (
          <div className="absolute top-2 left-2">
            <Badge>
              <span className="mr-1">⭐</span>
              {avgRating.toFixed(1)}
            </Badge>
          </div>
        )}
      </div>
      <CardBody>
        <h2 className={`font-semibold line-clamp-1 ${medium ? 'text-xl' : 'text-lg'}`}>{title}</h2>
        <div className="mt-1 text-sm text-zinc-400 line-clamp-1">{director} • {year}</div>
        <div className="mt-2">
          <RatingStars value={typeof avgRating === "number" ? avgRating : 0} />
        </div>
      </CardBody>
    </Card>
  );
};

export default MovieCard;
