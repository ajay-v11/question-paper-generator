import React from 'react';
import { Info } from 'lucide-react';

const QuestionConfig = ({ config, onConfigChange, difficulty, onDifficultyChange }) => {
  const handleCountChange = (type, value) => {
    const val = parseInt(value) || 0;
    if (val >= 0) {
      onConfigChange({ ...config, [type]: val });
    }
  };

  const totalQuestions = Object.values(config).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Question Configuration</h2>
        <p className="text-gray-600">Set the difficulty and number of questions per type.</p>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Difficulty Level</label>

        <div className="flex space-x-4">
          {['easy', 'medium', 'hard'].map((level) => (
            <label
              key={level}
              className={`flex-1 flex items-center justify-center p-4 rounded-lg border cursor-pointer transition-all ${
                difficulty === level
                  ? level === 'easy'
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : level === 'medium'
                    ? 'bg-yellow-50 border-yellow-500 text-yellow-700'
                    : 'bg-red-50 border-red-500 text-red-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="difficulty"
                value={level}
                checked={difficulty === level}
                onChange={(e) => onDifficultyChange(e.target.value)}
                className="hidden"
              />
              <span className="capitalize font-bold">{level}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Number of Questions</label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Multiple Choice (MCQ)</label>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 bg-gray-800 text-white text-xs rounded p-2 z-10">
                  Standard 4-option MCQs with one correct answer.
                </div>
              </div>
            </div>
            <input
              type="number"
              min="0"
              value={config.mcq}
              onChange={(e) => handleCountChange('mcq', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Fill in the Blanks</label>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 bg-gray-800 text-white text-xs rounded p-2 z-10">
                  Sentences with missing keywords.
                </div>
              </div>
            </div>
            <input
              type="number"
              min="0"
              value={config.fill_blanks}
              onChange={(e) => handleCountChange('fill_blanks', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Short Answer</label>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 bg-gray-800 text-white text-xs rounded p-2 z-10">
                  Questions requiring 2-3 sentence answers (2-5 marks).
                </div>
              </div>
            </div>
            <input
              type="number"
              min="0"
              value={config.short}
              onChange={(e) => handleCountChange('short', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Long Answer</label>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 bg-gray-800 text-white text-xs rounded p-2 z-10">
                  Detailed questions requiring paragraph answers (10+ marks).
                </div>
              </div>
            </div>
            <input
              type="number"
              min="0"
              value={config.long}
              onChange={(e) => handleCountChange('long', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
        <span className="font-medium text-gray-700">Total Questions:</span>
        <span className="text-2xl font-bold text-blue-600">{totalQuestions}</span>
      </div>
    </div>
  );
};

export default QuestionConfig;
