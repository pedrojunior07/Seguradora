import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "auth/AuthContext";

export default function ProtectedRoute({ children, allowedPerfis }) {
  const { isAuthenticated, loading, perfil } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) return <Navigate to="/" replace />;

  if (allowedPerfis && allowedPerfis.length > 0 && !allowedPerfis.includes(perfil)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedPerfis: PropTypes.arrayOf(PropTypes.string),
};

ProtectedRoute.defaultProps = {
  allowedPerfis: null,
};
