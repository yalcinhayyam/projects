import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  roles?: ('admin' | 'user')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role!)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;