import { Link } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function ReviewsView({ reviews }) {
    if (!reviews || reviews.length === 0)
        return <p className="text-center text-gray-500 dark:text-gray-400 py-8">No reviews found.</p>;

    return (
        <ul className="space-y-4">
            {reviews.map((review) => {
                const movieTitle = review.movie?.title ?? review.movieTitle ?? "Unknown Movie";
                const movieId = review.movie?.id ?? review.movieId;
                const poster = review.movie?.poster;

                return (
                    <li
                        key={review.id}
                        className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                        <div className="flex gap-4">
                            {poster && (
                                <Link to={`/movies/${movieId}`} className="flex-shrink-0">
                                    <img
                                        src={`${BASE_URL}${poster}`}
                                        alt={movieTitle}
                                        className="w-16 h-24 object-cover rounded-md"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                </Link>
                            )}
                            <div className="flex-1">
                                <Link to={`/movies/${movieId}`}>
                                    <h3 className="font-semibold text-lg text-blue-600 dark:text-blue-400 hover:underline">
                                        {movieTitle}
                                    </h3>
                                </Link>
                                <div className="flex items-center gap-1 mb-2">
                                    <span className="text-yellow-500">★</span>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{review.rating}/5</span>
                                    <span className="text-gray-400 text-xs ml-2">• {new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 line-clamp-3">{review.content ?? review.comment}</p>
                            </div>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
