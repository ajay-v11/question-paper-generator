import React from 'react';
import { FileText, CheckCircle } from 'lucide-react';

const PreviewSummary = ({ formData, title, onTitleChange }) => {
  const { selectedUnits, unitContent, questionConfig, difficulty, customInstructions } = formData;
  const totalQuestions = Object.values(questionConfig).reduce((a, b) => a + b, 0);
  const unitCount = selectedUnits.length;
  const questionsPerUnit = unitCount > 0 ? (totalQuestions / unitCount).toFixed(1) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Review & Generate</h2>
        <p className="text-gray-600">Review your settings before generating the paper.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Paper Title</label>

          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
            placeholder="e.g., Mid-Term Examination 2024"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-800 border-b pb-2">Configuration</h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block">Difficulty</span>
                <span className={`font-medium capitalize ${
                  difficulty === 'easy' ? 'text-green-600' : 
                  difficulty === 'medium' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {difficulty}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Total Questions</span>
                <span className="font-medium text-gray-900">{totalQuestions}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 block">Breakdown</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <span>MCQ: {questionConfig.mcq}</span>
                  <span>Fill Blanks: {questionConfig.fill_blanks}</span>
                  <span>Short: {questionConfig.short}</span>
                  <span>Long: {questionConfig.long}</span>
                </div>
                {unitCount > 0 && (
                   <div className="mt-3 text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-100">
                     Estimated ~{questionsPerUnit} questions per unit
                   </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-800 border-b pb-2">Content Sources</h3>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {selectedUnits.map(unit => (
                  <span key={unit} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                    Unit {unit}
                  </span>
                ))}
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedUnits.map(unit => (
                  <div key={unit} className="text-sm flex items-start space-x-2">
                    <div className="mt-1">
                      {unitContent[unit]?.file ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-300" />
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Unit {unit}</span>
                      <p className="text-xs text-gray-500 truncate w-40">
                        {unitContent[unit]?.file ? unitContent[unit].file.name : 'Syllabus text only'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {customInstructions && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Custom Instructions</h3>

            <p className="text-sm text-gray-600 italic">"{customInstructions}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewSummary;
