import { Navigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== 'super_admin') {
        // Se não for super admin, redireciona para dashboard ou página não autorizada
        return <Navigate to="/seguradora/dashboard" replace />;
    }

    return children;
};

export default AdminRoute;
