import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/Profile';
import StudentDashboard from './pages/student/Dashboard';
import InstructorDashboard from './pages/instructor/Dashboard';
import SimpleAdminDashboard from './pages/admin/SimpleAdminDashboard';
import AdminCourseManagement from './pages/admin/CourseManagement';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import PaymentSuccess from './pages/PaymentSuccess';
import Dashboard from './pages/Dashboard';

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppInitializer from './components/AppInitializer';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function App() {
  return (
    <Elements stripe={stripePromise}>
      <Router>
        <AppInitializer>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/student/dashboard" 
                  element={
                    <ProtectedRoute role="student">
                      <StudentDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/instructor/dashboard" 
                  element={
                    <ProtectedRoute role="instructor">
                      <InstructorDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <ProtectedRoute role="admin">
                      <SimpleAdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/courses" 
                  element={
                    <ProtectedRoute role="admin">
                      <AdminCourseManagement />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <Footer />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </AppInitializer>
      </Router>
    </Elements>
  );
}

export default App;
