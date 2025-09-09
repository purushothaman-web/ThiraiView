import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
  <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="ThiraiView" className="h-8 w-auto" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Discover, review, and share your favorite movies with the ThiraiView community.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/FrontEndExplorer-Temp" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"><img src="https://img.icons8.com/glyph-neue/64/github.png" alt="GitHub" className="w-9 h-9" /> </a>
              <a href="mailto:rpurushothaman500@gmail.com" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"><img src="https://img.icons8.com/ios-filled/50/circled-envelope.png" alt="circled-envelope" className='w-9 h-9'/></a>
              <a href="https://purushoth-dev.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"><img src="https://img.icons8.com/ios-filled/50/user-male-circle.png" alt="Portfolio" className="w-9 h-9" /></a>
              <a href="https://www.linkedin.com/in/purushothaman-r-web-dev/" target='_blank' rel='noopener noreferrer' className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"><img src="https://img.icons8.com/glyph-neue/64/linkedin-circled.png" alt="LinkedIn" className='w-9 h-9' /></a>
              <a href="https://github.com/FrontEndExplorer-Temp/ThiraiView" target='_blank' rel='noopener noreferrer' className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"><img src="https://img.icons8.com/ios-filled/50/git.png" alt="Repository" className='w-8 h-8' /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/feed" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                  Feed
                </Link>
              </li>
              <li>
                <Link to="/watchlist" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                  Watchlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Features</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-600 dark:text-gray-400">Movie Reviews</span>
              </li>
              <li>
                <span className="text-gray-600 dark:text-gray-400">Social Feed</span>
              </li>
              <li>
                <span className="text-gray-600 dark:text-gray-400">Follow Users</span>
              </li>
              <li>
                <span className="text-gray-600 dark:text-gray-400">Comments & Discussions</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 dark:text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} ThiraiView. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                Terms of Service
              </Link>
              <Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                About
              </Link>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Built with</p>
            <div className="flex justify-center space-x-6 text-xs text-gray-500 dark:text-gray-500">
              <span>React</span>
              <span>•</span>
              <span>Node.js</span>
              <span>•</span>
              <span>PostgreSQL</span>
              <span>•</span>
              <span>Prisma</span>
              <span>•</span>
              <span>Tailwind CSS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
