import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPapers, deletePaper } from '../services/paperService';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { Eye, Trash2, FileText, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const PapersList = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const data = await getPapers(page, limit);
      if (data.length === limit) {
        setHasMore(true);
      } else {
        setHasMore(false);
      }
      setPapers(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load papers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePaper(deleteId);
      setPapers(papers.filter(p => p.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete paper');
    }
  };

  const handleDownload = (paperId, format) => {
    navigate(`/papers/${paperId}`);
  };

  if (loading && papers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Generated Papers</h1>
          <p className="text-gray-600">View and manage your generated question papers</p>
        </div>
        <button
          onClick={() => navigate('/faculty/dashboard')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Paper
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {papers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No papers found. Create your first paper!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {papers.map((paper) => (
                  <tr key={paper.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{paper.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-600">{paper.subject_id}</span> 
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {paper.units.join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${paper.difficulty === 'easy' ? 'bg-green-100 text-green-800' : 
                          paper.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {paper.difficulty.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(paper.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/papers/${paper.id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="View"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(paper.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className={`flex items-center px-4 py-2 border rounded-lg ${
            page === 1 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </button>
        <span className="text-gray-600">
          Page {page}
        </span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={!hasMore && papers.length < limit}
          className={`flex items-center px-4 py-2 border rounded-lg ${
            (!hasMore && papers.length < limit)
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </button>
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Paper"
        message={`Are you sure you want to delete this paper? This action cannot be undone.`}
      />
    </div>
  );
};

export default PapersList;
