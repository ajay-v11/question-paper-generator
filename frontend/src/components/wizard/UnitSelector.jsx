import React from 'react';

const UnitSelector = ({ selectedUnits, onUnitChange }) => {
  const units = [1, 2, 3, 4, 5];

  const handleToggle = (unit) => {
    if (selectedUnits.includes(unit)) {
      onUnitChange(selectedUnits.filter((u) => u !== unit));
    } else {
      onUnitChange([...selectedUnits, unit].sort());
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Select Units</h2>
      <p className="text-gray-600">Choose the units you want to include in this question paper.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        {units.map((unit) => (
          <div
            key={unit}
            onClick={() => handleToggle(unit)}
            className={`cursor-pointer rounded-lg border-2 p-4 flex flex-col items-center justify-center transition-all ${
              selectedUnits.includes(unit)
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                : 'border-gray-200 hover:border-blue-300 text-gray-600'
            }`}
          >
            <span className="text-lg font-bold">Unit {unit}</span>
            <div
              className={`mt-2 w-6 h-6 rounded-full border flex items-center justify-center ${
                selectedUnits.includes(unit)
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300'
              }`}
            >
              {selectedUnits.includes(unit) && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {selectedUnits.length === 0 && (
        <p className="text-red-500 text-sm mt-2">Please select at least one unit to proceed.</p>
      )}
    </div>
  );
};

export default UnitSelector;
