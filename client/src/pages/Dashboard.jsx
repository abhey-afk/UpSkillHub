import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Loader2 } from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Redirect to role-specific dashboard
    const dashboardPath = 
      user?.role === 'student' ? '/student/dashboard' : 
      user?.role === 'instructor' ? '/instructor/dashboard' : 
      user?.role === 'admin' ? '/admin/dashboard' : '/courses';
    
    navigate(dashboardPath, { replace: true });
  }, [user, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary-600 mx-auto mb-4 animate-spin" />
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}

export default Dashboard;
