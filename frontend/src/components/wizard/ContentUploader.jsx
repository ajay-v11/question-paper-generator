import React, { useState } from 'react';
import FileUpload from '../FileUpload';
import { ChevronDown, ChevronUp, FileText, Trash2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { uploadDocument, saveDocumentContent, processDocument, getDocumentStatus, getDocumentContent, processRAG, getRAGStatus } from '../../services/paperService';
import ProcessingStatus from '../ProcessingStatus';
import ExtractedTextPreview from '../ExtractedTextPreview';

const ContentUploader = ({ selectedUnits, unitContent, onContentChange }) => {
  const { subjectId } = useParams();
  const [expandedUnit, setExpandedUnit] = useState(selectedUnits[0]);

  const toggleUnit = (unit) => {
    setExpandedUnit(expandedUnit === unit ? null : unit);
  };

  const handleFileUpload = async (unit, files) => {
    if (files.length > 0) {
      const file = files[0];
      onContentChange(unit, 'file', file);
      onContentChange(unit, 'status', 'pending');

      try {
        onContentChange(unit, 'status', 'processing'); 
        const uploadRes = await uploadDocument(file);
        
        const docRes = await saveDocumentContent({
            subject_id: subjectId,
            unit_number: unit,
            file_path: uploadRes.file_path,
            file_name: uploadRes.file_name,
            file_type: file.name.split('.').pop(),
            syllabus_text: unitContent[unit]?.syllabus || ''
        });
        
        const docId = docRes.id;
        onContentChange(unit, 'docId', docId);
        
        await processDocument(docId);
        
        const interval = setInterval(async () => {
            try {
                const statusRes = await getDocumentStatus(docId);
                if (statusRes.status === 'completed') {
                    clearInterval(interval);
                    
                    const contentRes = await getDocumentContent(docId);
                    onContentChange(unit, 'extractedText', contentRes.content);

                    onContentChange(unit, 'status', 'indexing');
                    await processRAG(docId);

                    const ragInterval = setInterval(async () => {
                        try {
                            const ragStatus = await getRAGStatus(docId);
                            if (ragStatus.status === 'completed') {
                                clearInterval(ragInterval);
                                onContentChange(unit, 'status', 'ready');
                            }
                        } catch (e) {
                            console.error("RAG Polling error", e);
                            clearInterval(ragInterval);
                        }
                    }, 2000);

                } else if (statusRes.status === 'failed') {
                    clearInterval(interval);
                    onContentChange(unit, 'status', 'failed');
                }
            } catch (e) {
                console.error("Polling error", e);
                clearInterval(interval);
            }
        }, 2000);
        
      } catch (e) {
        console.error("Upload/Process error", e);
        onContentChange(unit, 'status', 'failed');
      }
    }
  };

  const handleSyllabusChange = (unit, text) => {
    onContentChange(unit, 'syllabus', text);
  };

  const removeFile = (unit) => {
    onContentChange(unit, 'file', null);
    onContentChange(unit, 'status', null);
    onContentChange(unit, 'docId', null);
    onContentChange(unit, 'extractedText', null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Upload Content</h2>
      <p className="text-gray-600">Provide syllabus and reference materials for each selected unit.</p>

      <div className="space-y-4">
        {selectedUnits.map((unit) => (
          <div key={unit} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => toggleUnit(unit)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="font-semibold text-gray-700">Unit {unit}</span>
                {unitContent[unit]?.file && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center">
                    File Uploaded
                  </span>
                )}
                {unitContent[unit]?.status && (
                    <ProcessingStatus status={unitContent[unit].status} />
                )}
              </div>
              {expandedUnit === unit ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>

            {expandedUnit === unit && (
              <div className="p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Reference Material (PDF, DOCX, PPTX)</label>

                  {unitContent[unit]?.file ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-blue-500" />
                            <span className="text-sm text-gray-700 truncate max-w-xs">{unitContent[unit].file.name}</span>
                        </div>
                        <button
                            onClick={() => removeFile(unit)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Status:</span>
                            <ProcessingStatus status={unitContent[unit]?.status || 'pending'} />
                        </div>
                        
                        {unitContent[unit]?.extractedText && (
                            <ExtractedTextPreview content={unitContent[unit].extractedText} />
                        )}
                    </div>
                  ) : (
                      <FileUpload
                        onDrop={(files) => handleFileUpload(unit, files)}
                        accept={{
                          'application/pdf': ['.pdf'],
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                          'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
                          'text/plain': ['.txt']
                        }}
                      />
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Syllabus / Topics</label>

                  <textarea
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Paste the syllabus or key topics for this unit..."
                    value={unitContent[unit]?.syllabus || ''}
                    onChange={(e) => handleSyllabusChange(unit, e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentUploader;
