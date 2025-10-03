import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const FeedbackForm: React.FC = () => {
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Use FormSpree for form submission
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        setIsSubmitted(true);
        form.reset();
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-3 text-green-600">
          <CheckCircle className="w-6 h-6" />
          <div>
            <h3 className="text-lg font-semibold">Thank you for your feedback!</h3>
            <p className="text-sm text-gray-600 mt-1">
              Your input helps us improve LazyCal for everyone.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsSubmitted(false)}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Submit more feedback
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Share Your Feedback</h3>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Feedback Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What type of feedback do you have?
          </label>
          <select
            name="feedback-type"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select feedback type</option>
            <option value="feature-request">Feature Request</option>
            <option value="bug-report">Bug Report</option>
            <option value="improvement">Improvement Suggestion</option>
            <option value="general">General Feedback</option>
            <option value="praise">Praise</option>
          </select>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How would you rate your experience with LazyCal?
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <label key={rating} className="flex items-center">
                <input
                  type="radio"
                  name="rating"
                  value={rating}
                  className="sr-only"
                />
                <span className="cursor-pointer text-2xl hover:text-yellow-400 transition-colors">
                  ⭐
                </span>
                <span className="sr-only">{rating} stars</span>
              </label>
            ))}
          </div>
        </div>

        {/* Main Feedback */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your feedback *
          </label>
          <textarea
            name="feedback"
            required
            rows={4}
            placeholder="Tell us what you think about LazyCal. What features would you like to see? What could be improved?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
          />
        </div>

        {/* Contact Info (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email (optional)
          </label>
          <input
            type="email"
            name="email"
            placeholder="your@email.com - if you'd like a response"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Only provide your email if you'd like us to follow up with you.
          </p>
        </div>

        {/* Usage Context */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How do you primarily use LazyCal?
          </label>
          <div className="space-y-2">
            {[
              'Personal event planning',
              'Work/business scheduling',
              'Family coordination',
              'Community events',
              'Other'
            ].map((usage) => (
              <label key={usage} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="usage"
                  value={usage}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{usage}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Sending...' : 'Send Feedback'}
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-3">
        Your feedback is valuable to us and helps make LazyCal better for everyone. 
        We read every submission and use your input to prioritize improvements.
      </p>
    </div>
  );
};

export default FeedbackForm;