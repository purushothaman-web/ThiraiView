import { Link } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function MoviesView({ movies }) {
    if (!movies || movies.length === 0)
        return <p className="text-center text-gray-500 dark:text-gray-400 py-8">No movies found.</p>;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {movies.map((movie) => (
                <Link
                    key={movie.id}
                    to={`/movies/${movie.id}`}
                    className="group relative border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                    <div className="aspect-[2/3] overflow-hidden">
                        <img
                            src={`${BASE_URL}${movie.poster}`}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                        />
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-800">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {movie.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {movie.year}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
}
