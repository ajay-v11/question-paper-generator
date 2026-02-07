import React, { useState } from 'react';

const ExtractedTextPreview = ({ content }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!content) return null;

  return (
    <div className="mt-2">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none"
      >
        {isOpen ? 'Hide Extracted Text' : 'View Extracted Text'}
      </button>
      
      {isOpen && (
        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md text-xs font-mono h-48 overflow-y-auto whitespace-pre-wrap text-gray-700">
          {content}
        </div>
      )}
    </div>
  );
};

export default ExtractedTextPreview;
