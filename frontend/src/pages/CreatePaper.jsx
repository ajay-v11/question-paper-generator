import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import StepIndicator from '../components/wizard/StepIndicator';
import UnitSelector from '../components/wizard/UnitSelector';
import ContentUploader from '../components/wizard/ContentUploader';
import QuestionConfig from '../components/wizard/QuestionConfig';
import CustomInstructions from '../components/wizard/CustomInstructions';
import PreviewSummary from '../components/wizard/PreviewSummary';
import { uploadDocument, saveDocumentContent, createPaperDraft } from '../services/paperService';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';

const CreatePaper = () => {
  const { subjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const subjectName = location.state?.subjectName || 'Subject';

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: `${subjectName} - Question Paper`,
    selectedUnits: [],
    unitContent: {},
    questionConfig: {

      mcq: 5,
      fill_blanks: 5,
      short: 5,
      long: 2
    },
    difficulty: 'medium',
    customInstructions: ''
  });

  const steps = [
    { id: 1, label: 'Units' },
    { id: 2, label: 'Content' },
    { id: 3, label: 'Questions' },
    { id: 4, label: 'Instructions' },
    { id: 5, label: 'Preview' }
  ];

  const handleNext = () => {
    if (currentStep === 1 && formData.selectedUnits.length === 0) {
      alert('Please select at least one unit.');
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleUnitChange = (units) => {
    setFormData((prev) => ({ ...prev, selectedUnits: units }));
  };

  const handleContentChange = (unit, type, value) => {
    setFormData((prev) => ({
      ...prev,
      unitContent: {
        ...prev.unitContent,
        [unit]: {
          ...prev.unitContent[unit],
          [type]: value
        }
      }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      for (const unit of formData.selectedUnits) {
        const content = formData.unitContent[unit];

        let filePath = null;
        let fileName = null;

        if (content?.file) {
          const uploadRes = await uploadDocument(content.file);
          filePath = uploadRes.file_path;
          fileName = uploadRes.file_name;
        }

        if (content?.file || content?.syllabus) {
            await saveDocumentContent({
                subject_id: subjectId,

                unit_number: unit,
                file_path: filePath,
                file_name: fileName,
                file_type: content?.file?.type,
                syllabus_text: content?.syllabus
            });
        }
      }

      await createPaperDraft({
        subject_id: subjectId,
        title: formData.title,

        units: formData.selectedUnits,
        difficulty: formData.difficulty,
        custom_instructions: formData.customInstructions,
        question_config: formData.questionConfig
      });

      alert('Paper draft created successfully! Generation coming soon.');
      navigate('/faculty-dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to create paper. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-4">

          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Create New Paper: {subjectName}</h1>
        </div>
        <button className="text-sm text-gray-500 hover:text-gray-700 font-medium">
          Save as Draft
        </button>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px] flex flex-col">
          <StepIndicator currentStep={currentStep} steps={steps} />

          
          <div className="flex-1 p-8 overflow-y-auto">
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {currentStep === 1 && (
              <UnitSelector
                selectedUnits={formData.selectedUnits}
                onUnitChange={handleUnitChange}
              />
            )}
            {currentStep === 2 && (
              <ContentUploader
                selectedUnits={formData.selectedUnits}
                unitContent={formData.unitContent}
                onContentChange={handleContentChange}
              />
            )}
            {currentStep === 3 && (
              <QuestionConfig
                config={formData.questionConfig}
                onConfigChange={(cfg) => setFormData(prev => ({ ...prev, questionConfig: cfg }))}
                difficulty={formData.difficulty}
                onDifficultyChange={(diff) => setFormData(prev => ({ ...prev, difficulty: diff }))}
              />
            )}
            {currentStep === 4 && (
              <CustomInstructions
                instructions={formData.customInstructions}
                onInstructionsChange={(instr) => setFormData(prev => ({ ...prev, customInstructions: instr }))}
              />
            )}
            {currentStep === 5 && (
              <PreviewSummary
                formData={formData}
                title={formData.title}
                onTitleChange={(t) => setFormData(prev => ({ ...prev, title: t }))}
              />
            )}
          </div>

          <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-between items-center">
            <button
              onClick={handleBack}

              disabled={currentStep === 1}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Back
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center shadow-md ${
                  loading ? 'opacity-70 cursor-wait' : ''
                }`}
              >
                {loading ? 'Processing...' : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Generate Paper
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreatePaper;
