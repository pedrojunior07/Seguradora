import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const SocialCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setToken } = useAuth(); // Assuming useAuth exposes a way to set token, or we manually set it

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
            navigate('/login?error=' + encodeURIComponent(error));
            return;
        }

        if (token) {
            // Persist token
            localStorage.setItem('token', token);

            // Redirect to root, AppRouter handles the rest. 
            // We use window.location.href to force a clean slate and ensure 
            // AuthProvider re-initializes with the new token.
            window.location.href = '/';
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2 }}>
                Autenticando com Google...
            </Typography>
        </Box>
    );
};

export default SocialCallback;
