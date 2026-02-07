import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getPapers } from '../services/paperService';
import SubjectCard from '../components/SubjectCard';
import StatsCard from '../components/StatsCard';
import { useAuth } from '../context/AuthContext';
import { Book, FileText, BarChart2, LogOut, Loader2, Eye, Calendar } from 'lucide-react';

const FacultyDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState({ total_subjects: 0, papers_generated: 0, recent_papers: [] });
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsRes, statsRes, papersRes] = await Promise.all([
        api.get('/faculty/subjects'),
        api.get('/faculty/stats'),
        getPapers()
      ]);
      setSubjects(subjectsRes.data);
      setStats(statsRes.data);
      setPapers(papersRes);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
       <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">Faculty Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
                </div>
            ) : (
                <div className="px-4 sm:px-0 space-y-8">
                    {/* Stats Section */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <StatsCard name="Total Subjects" stat={stats.total_subjects} icon={Book} color="indigo" />
                        <StatsCard name="Papers Generated" stat={stats.papers_generated} icon={FileText} color="green" />
                        <StatsCard 
                            name="View Papers" 
                            stat="Go to List" 
                            icon={BarChart2} 
                            color="purple" 
                            onClick={() => navigate('/papers')}
                        />
                    </div>

                    {/* Subjects Section */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Subjects</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {subjects.map((subject) => (
                                <SubjectCard key={subject.id} subject={subject} />
                            ))}
                            {subjects.length === 0 && (
                                <div className="col-span-full text-center py-8 text-gray-500 bg-white rounded-lg shadow">
                                    No subjects allocated yet. Contact your administrator.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Papers Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Recent Papers</h2>
                            <button 
                                onClick={() => navigate('/papers')}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                View all
                            </button>
                        </div>
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            {papers.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {papers.map((paper) => (
                                        <li key={paper.id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <FileText className="h-5 w-5 text-gray-400" />
                                                        <div>
                                                            <p className="text-sm font-medium text-indigo-600">{paper.title}</p>
                                                            <p className="text-sm text-gray-500">
                                                                Units: {paper.units?.join(', ') || 'N/A'} |
                                                                Difficulty: {paper.difficulty?.toUpperCase() || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        paper.status === 'generated'
                                                            ? 'bg-green-100 text-green-800'
                                                            : paper.status === 'failed'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {paper.status === 'generated' ? 'Completed' : paper.status}
                                                    </span>
                                                    <span className="text-xs text-gray-500 flex items-center">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        {new Date(paper.created_at).toLocaleDateString()}
                                                    </span>
                                                    {paper.status === 'generated' && (
                                                        <button
                                                            onClick={() => navigate(`/papers/${paper.id}`)}
                                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                                        >
                                                            <Eye className="h-3 w-3 mr-1" />
                                                            View
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No papers generated yet. Create your first paper from a subject above.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboard;
