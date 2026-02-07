import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import CreatePaper from './pages/CreatePaper';
import GeneratedPaper from './pages/GeneratedPaper';
import PapersList from './pages/PapersList';
import ProtectedRoute from './components/ProtectedRoute';

function App() {

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
          
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/faculty-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyDashboard />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/subjects/:subjectId/create-paper"
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <CreatePaper />
              </ProtectedRoute>
            }
          />

          <Route
            path="/papers"
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <PapersList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/papers/:paperId"
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <GeneratedPaper />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" replace />} />

          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
