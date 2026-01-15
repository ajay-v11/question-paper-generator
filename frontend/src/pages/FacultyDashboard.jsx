import { useState, useEffect } from 'react';
import api from '../services/api';
import SubjectCard from '../components/SubjectCard';
import StatsCard from '../components/StatsCard';
import { useAuth } from '../context/AuthContext';
import { Book, FileText, BarChart2, LogOut, Loader2 } from 'lucide-react';

const FacultyDashboard = () => {
  const { user, logout } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState({ total_subjects: 0, papers_generated: 0, recent_papers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsRes, statsRes] = await Promise.all([
        api.get('/faculty/subjects'),
        api.get('/faculty/stats')
      ]);
      setSubjects(subjectsRes.data);
      setStats(statsRes.data);
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
                        <StatsCard name="View Papers" stat="Go to List" icon={BarChart2} color="purple" />
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
                </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboard;
