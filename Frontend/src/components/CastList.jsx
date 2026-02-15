import { Link } from 'react-router-dom';

const CastList = ({ cast }) => {
  if (!cast || cast.length === 0) return null;

  return (
    <section>
      <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-2">Top Cast</h3>
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
        {cast.slice(0, 15).map((person) => (
          <Link to={`/cast-mixer?ids=${person.id}`} key={person.id} className="w-32 shrink-0 snap-start group cursor-pointer block">
            <div className="w-32 h-40 rounded-xl overflow-hidden bg-gray-800 mb-3 shadow-lg border border-gray-800 group-hover:border-brand-yellow/50 transition-colors">
              {person.profile_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                  alt={person.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-600 text-xs font-bold uppercase p-2 text-center group-hover:text-brand-yellow transition-colors">
                  No Image
                </div>
              )}
            </div>
            <h4 className="font-bold text-sm text-gray-200 truncate group-hover:text-brand-yellow transition-colors">{person.name}</h4>
            <p className="text-xs text-gray-500 truncate">{person.character}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CastList;
