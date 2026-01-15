import { useState, useEffect } from 'react';
import api from '../services/api';
import { Loader2 } from 'lucide-react';

const FacultyAllocation = () => {
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [facultyRes, subjectsRes] = await Promise.all([
        api.get('/admin/faculty-list'),
        api.get('/subjects')
      ]);
      setFaculty(facultyRes.data);
      setSubjects(subjectsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/admin/allocate-subject', {
        faculty_id: selectedFaculty,
        subject_id: selectedSubject
      });
      setMessage({ type: 'success', text: 'Subject allocated successfully!' });
      setSelectedFaculty('');
      setSelectedSubject('');
    } catch (error) {
        console.error(error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Failed to allocate subject' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4"><Loader2 className="animate-spin h-6 w-6 text-indigo-600" /></div>;
  }

  return (
    <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mt-8">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Allocate Subjects</h3>
          <p className="mt-1 text-sm text-gray-500">
            Assign subjects to faculty members.
          </p>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <form onSubmit={handleAllocate}>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="faculty" className="block text-sm font-medium text-gray-700">Faculty</label>
                <select
                  id="faculty"
                  name="faculty"
                  required
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select Faculty</option>
                  {faculty.map((f) => (
                    <option key={f.id} value={f.id}>{f.name} ({f.email})</option>
                  ))}
                </select>
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
            </div>

            {message.text && (
              <div className={`mt-4 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {message.text}
              </div>
            )}

            <div className="mt-6 text-right">
              <button
                type="submit"
                disabled={isSubmitting || !selectedFaculty || !selectedSubject}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Allocate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FacultyAllocation;
