import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { paymentAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Processing your payment...');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus('error');
        setMessage('Invalid payment session');
        return;
      }

      try {
        // Verify payment with backend
        const response = await paymentAPI.confirmPayment(sessionId);
        
        if (response.data.success) {
          setStatus('success');
          setMessage('Payment successful! You are now enrolled in the course.');
          toast.success('Successfully enrolled in the course!');
          
          // Redirect to appropriate dashboard after 3 seconds
          setTimeout(() => {
            const dashboardPath = user?.role === 'student' ? '/student/dashboard' : 
                                 user?.role === 'instructor' ? '/instructor/dashboard' : 
                                 user?.role === 'admin' ? '/admin/dashboard' : '/courses';
            navigate(dashboardPath);
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to verify payment');
        toast.error('Payment verification failed');
      }
    };

    verifyPayment();
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 max-w-md w-full text-center"
      >
        {status === 'processing' && (
          <>
            <Loader2 className="w-16 h-16 text-primary-600 mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Processing Payment</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  const dashboardPath = user?.role === 'student' ? '/student/dashboard' : 
                                       user?.role === 'instructor' ? '/instructor/dashboard' : 
                                       user?.role === 'admin' ? '/admin/dashboard' : '/courses';
                  navigate(dashboardPath);
                }}
                className="w-full btn-luxury"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/courses')}
                className="w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Browse More Courses
              </button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/courses')}
                className="w-full btn-luxury"
              >
                Browse Courses
              </button>
              <button
                onClick={() => navigate(-1)}
                className="w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Go Back
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default PaymentSuccess;
