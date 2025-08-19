
import { Link } from 'wouter';
import { Heart } from 'lucide-react';

interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto ${className}`}>
      <div className="container mx-auto px-4 py-6">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          
          {/* Brand & Copyright */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">DayFuse</span>
              <span className="text-gray-600 dark:text-gray-400">|</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Productivity Simplified</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              © {currentYear} DayFuse. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center items-center space-x-6 text-sm">
            <Link href="/privacy">
              <a className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">
                Privacy Policy
              </a>
            </Link>
            <Link href="/terms">
              <a className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">
                Terms of Service
              </a>
            </Link>
            <Link href="/contact">
              <a className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">
                Contact
              </a>
            </Link>
          </div>

        </div>

        {/* Developer Attribution */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Created with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>by</span>
            <a 
              href="https://github.com/CodeWithRomi" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              CodeWithRomi
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}