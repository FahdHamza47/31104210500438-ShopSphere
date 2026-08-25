import { Navigate, useLocation } from "react-router-dom";
import { type ReactNode, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({
  children,
  adminOnly = false,
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const isDeniedAdmin = !loading && user && adminOnly && user.role !== "admin";

  // Fire the toast as a side effect (never call toast() directly during render)
  useEffect(() => {
    if (isDeniedAdmin) {
      toast.error("Not authorized: admin access only");
    }
  }, [isDeniedAdmin]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
