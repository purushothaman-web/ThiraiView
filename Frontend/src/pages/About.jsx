import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">About ThiraiView</h1>
        <p className="text-gray-400 text-lg">
          Discover, review, and discuss your favorite movies with fellow cinephiles
        </p>
      </div>

      <div className="space-y-8">
        <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="p-4 md:p-5">
            <h2 className="text-2xl font-semibold text-white mb-4">Our Mission</h2>
            <div className="space-y-4 text-gray-300">
              <p>ThiraiView is a social movie review platform where film enthusiasts come together to discover, discuss, and celebrate cinema.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="p-4 md:p-5">
            <h2 className="text-2xl font-semibold text-white mb-4">Features</h2>
            <div className="space-y-4 text-gray-300">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Movie reviews and ratings</li>
                <li>Social features and user following</li>
                <li>Comments and discussions</li>
                <li>Personal watchlists</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="p-4 md:p-5">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white mb-4">Join Our Community</h2>
              <p className="text-gray-300 mb-6">
                Ready to start your movie journey? Join thousands of film enthusiasts on ThiraiView.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/signup" 
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition-colors font-medium"
                >
                  Create Account
                </Link>
                <Link 
                  to="/" 
                  className="border border-gray-600 text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Explore Movies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;