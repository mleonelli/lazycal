import React from 'react';
import { Heart, ExternalLink, Github, MessageSquare } from 'lucide-react';

interface FooterProps {
  onFeedbackClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onFeedbackClick }) => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-600">
          {/* Feedback Link */}
          <button
            onClick={onFeedbackClick}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Share Feedback</span>
          </button>
          
          <div className="hidden sm:block text-gray-300">•</div>
          
          <div className="flex items-center gap-2">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
            <span>by</span>
            <a
              href="https://mauroleonelli.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors inline-flex items-center gap-1"
            >
              Mauro Leonelli
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          
          <div className="hidden sm:block text-gray-300">•</div>
          
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/mleonelli/lazycal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-800 transition-colors inline-flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              <span>View on GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;