import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPaperWithQuestions, downloadPaper, deletePaper } from '../services/paperService';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { ChevronLeft, Download, Eye, EyeOff, Printer, Trash2 } from 'lucide-react';

const GeneratedPaper = () => {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const data = await getPaperWithQuestions(paperId);
        setPaper(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load paper. Please try again.');
        setLoading(false);
      }
    };

    fetchPaper();
  }, [paperId]);

  const printPaper = () => {
    window.print();
  };

  const handleDownload = async (format) => {
    try {
      setDownloading(true);
      const blob = await downloadPaper(paperId, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${paper.title.replace(/\s+/g, '_')}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download paper');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePaper(paperId);
      setShowDeleteModal(false);
      navigate('/papers');
    } catch (err) {
      console.error(err);
      alert('Failed to delete paper');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading paper...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 text-red-700 p-6 rounded-lg mb-4">{error}</div>
          <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!paper || !paper.questions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Paper not found or still being generated.</p>
          <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { mcqs = [], fill_blanks = [], short = [], long = [] } = paper.questions;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - not printed */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 no-print">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/papers')} className="text-gray-500 hover:text-gray-700">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">{paper.title}</h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 hidden group-hover:block">
              <button
                onClick={() => handleDownload('pdf')}
                disabled={downloading}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
              >
                Download PDF
              </button>
              <button
                onClick={() => handleDownload('docx')}
                disabled={downloading}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
              >
                Download DOCX
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              showAnswers
                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showAnswers ? 'Hide' : 'Show'} Answers</span>
          </button>
          
          <button
            onClick={printPaper}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Paper"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Paper content - printable */}
      <main className="max-w-4xl mx-auto p-8 bg-white shadow-sm my-8 print:shadow-none print:my-0">
        {/* Paper header */}
        <div className="border-b-2 border-gray-800 pb-6 mb-8">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">{paper.title}</h1>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p><strong>Subject:</strong> {paper.subject_name || 'N/A'}</p>
              <p><strong>Units:</strong> {paper.units?.join(', ') || 'N/A'}</p>
            </div>
            <div className="text-right">
              <p><strong>Difficulty:</strong> {paper.difficulty?.toUpperCase() || 'N/A'}</p>
              <p><strong>Date:</strong> {new Date(paper.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Section A: MCQs */}
        {mcqs.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-300">
              Section A: Multiple Choice Questions ({mcqs.length} questions)
            </h2>
            <div className="space-y-6">
              {mcqs.map((mcq, idx) => (
                <div key={mcq.id || idx} className="text-gray-800">
                  <p className="font-medium mb-3">
                    <span className="text-gray-500 mr-2">Q{idx + 1}.</span>
                    {mcq.question}
                    {mcq.unit && (
                      <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                        Unit {mcq.unit}
                      </span>
                    )}
                  </p>
                  <div className="ml-6 space-y-2">
                    {mcq.options?.map((option, optIdx) => (
                      <div
                        key={optIdx}
                        className={`p-2 rounded ${
                          showAnswers && option === mcq.correct_answer
                            ? 'bg-green-100 border border-green-400 text-green-800 font-medium'
                            : 'text-gray-700'
                        }`}
                      >
                        <span className="text-gray-500 mr-2">{String.fromCharCode(97 + optIdx)})</span>
                        {option}
                      </div>
                    ))}
                  </div>
                  {showAnswers && mcq.explanation && (
                    <div className="ml-6 mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                      <strong>Explanation:</strong> {mcq.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section B: Fill in the Blanks */}
        {fill_blanks.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-300">
              Section B: Fill in the Blanks ({fill_blanks.length} questions)
            </h2>
            <div className="space-y-4">
              {fill_blanks.map((fb, idx) => (
                <div key={fb.id || idx} className="text-gray-800">
                  <p className="font-medium">
                    <span className="text-gray-500 mr-2">Q{idx + 1}.</span>
                    {fb.question}
                    {fb.unit && (
                      <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                        Unit {fb.unit}
                      </span>
                    )}
                  </p>
                  {showAnswers && (
                    <div className="ml-6 mt-2">
                      <span className="text-green-700 font-medium">Answer: </span>
                      <span className="text-gray-700">{fb.answer}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section C: Short Answer Questions */}
        {short.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-300">
              Section C: Short Answer Questions ({short.length} questions)
            </h2>
            <div className="space-y-6">
              {short.map((sa, idx) => (
                <div key={sa.id || idx} className="text-gray-800">
                  <p className="font-medium mb-2">
                    <span className="text-gray-500 mr-2">Q{idx + 1}.</span>
                    {sa.question}
                    <span className="text-gray-500 ml-2">[{sa.marks || 5} marks]</span>
                    {sa.unit && (
                      <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                        Unit {sa.unit}
                      </span>
                    )}
                  </p>
                  {showAnswers && sa.expected_points && (
                    <div className="ml-6 mt-3">
                      <p className="font-medium text-gray-700 mb-2">Expected points:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {sa.expected_points.map((point, pIdx) => (
                          <li key={pIdx}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section D: Long Answer Questions */}
        {long.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-300">
              Section D: Long Answer Questions ({long.length} questions)
            </h2>
            <div className="space-y-8">
              {long.map((la, idx) => (
                <div key={la.id || idx} className="text-gray-800">
                  <p className="font-medium mb-3">
                    <span className="text-gray-500 mr-2">Q{idx + 1}.</span>
                    {la.question}
                    <span className="text-gray-500 ml-2">[{la.marks || 10} marks]</span>
                    {la.unit && (
                      <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                        Unit {la.unit}
                      </span>
                    )}
                  </p>
                  {showAnswers && la.expected_points && (
                    <div className="ml-6 mt-3">
                      <p className="font-medium text-gray-700 mb-2">Expected points:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {la.expected_points.map((point, pIdx) => (
                          <li key={pIdx}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-center text-gray-500 text-sm">
          <p>End of Question Paper</p>
        </div>
      </main>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
        }
      `}</style>
      
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Paper"
        message="Are you sure you want to delete this paper? This action cannot be undone."
      />
    </div>
  );
};

export default GeneratedPaper;
