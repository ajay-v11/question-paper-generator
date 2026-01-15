import { useAuth } from '../context/AuthContext';
import RegisterFaculty from '../components/RegisterFaculty';
import SubjectManagement from '../components/SubjectManagement';
import FacultyAllocation from '../components/FacultyAllocation';
import { LogOut } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">Admin Dashboard</h1>
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
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
             <div className="px-4 sm:px-0">
               <SubjectManagement />
             </div>
             <div className="px-4 sm:px-0">
               <FacultyAllocation />
             </div>
             <div className="px-4 sm:px-0">
               <RegisterFaculty />
             </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
