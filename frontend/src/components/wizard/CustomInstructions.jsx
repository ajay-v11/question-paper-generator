import React from 'react';

const CustomInstructions = ({ instructions, onInstructionsChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Custom Instructions</h2>
        <p className="text-gray-600">Add specific topics to focus on or special instructions for the AI.</p>
      </div>

      <div className="space-y-2">
        <textarea
          rows={8}
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Focus more on the OSI model in Unit 1. Include a case study question for Unit 3."
          value={instructions}
          onChange={(e) => onInstructionsChange(e.target.value)}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Be specific about topics, formats, or constraints.</span>
          <span>{instructions.length} characters</span>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h4 className="font-medium text-blue-800 mb-2">Tips for better results:</h4>
        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
          <li>Mention specific diagrams you want students to draw.</li>
          <li>Specify if you want application-based or theoretical questions.</li>
          <li>List key concepts that must be covered.</li>
        </ul>
      </div>
    </div>
  );
};

export default CustomInstructions;
