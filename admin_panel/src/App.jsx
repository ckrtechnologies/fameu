import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useVerifySessionQuery } from './store/api/adminEndpoints';
import { setCredentials } from './store/slices/authSlice';

// Layout & Pages
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import KYCVerification from './pages/KYCVerification';
import UserManagement from './pages/UserManagement';
import Auditions from './pages/Auditions';
import Applications from './pages/Applications';
import FraudReports from './pages/FraudReports';
import Blacklist from './pages/Blacklist';
import Payments from './pages/Payments';
import CMS from './pages/CMS';
import ProfessionsManagement from './pages/ProfessionsManagement';
import NMS from './pages/NMS';
import Messaging from './pages/Messaging';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  // Only execute query if we have a token (skip otherwise so we don't send useless requests)
  const { data, isLoading, isError } = useVerifySessionQuery(undefined, {
    skip: !token,
  });
  const dispatch = useDispatch();

  useEffect(() => {
    if (data?.user) {
      dispatch(setCredentials({ user: data.user, token }));
    }
  }, [data, dispatch, token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-dark)' }}>Loading...</div>;
  }

  if (isError || !data?.success) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Admin Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="kyc" element={<KYCVerification />} />
          <Route path="users" element={<Navigate to="/users/artist" replace />} />
          <Route path="users/artist" element={<UserManagement role="artist" />} />
          <Route path="users/hiring" element={<UserManagement role="hiring" />} />
          <Route path="messaging" element={<Messaging />} />
          <Route path="auditions" element={<Auditions />} />
          <Route path="applications" element={<Applications />} />
          <Route path="fraud-reports" element={<FraudReports />} />
          <Route path="blacklist" element={<Blacklist />} />
          <Route path="payments" element={<Payments />} />
          <Route path="cms" element={<CMS />} />
          <Route path="professions" element={<ProfessionsManagement />} />
          <Route path="nms" element={<NMS />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
