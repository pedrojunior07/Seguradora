import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    Container,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useAuth } from '@context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await login(formData.email, formData.password);
            const profile = data.user.perfil;
            console.log("token:   " + data.token)

            if (profile === 'seguradora') navigate('/seguradora/dashboard');
            else if (profile === 'corretora') navigate('/corretora/dashboard');
            else if (profile === 'cliente') navigate('/cliente/dashboard');
            else if (profile === 'admin') navigate('/admin/dashboard');
            else navigate('/');
        } catch (err) {
            console.error('Login error:', err);

            // Extract error message from API response
            if (err.data?.message) {
                setError(err.data.message);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Email ou senha inválidos. Verifique suas credenciais e tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const [successMessage, setSuccessMessage] = useState('');

    // Check for URL params (verified=1) using useEffect
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('verified')) {
            setSuccessMessage('Email verificado com sucesso! Pode entrar.');
            // Clear the query string to avoid showing the message on refresh
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleResendEmail = async () => {
        if (!formData.email) {
            setError('Preencha o email para reenviar a verificação.');
            return;
        }
        try {
            await api.post('/email/resend', { email: formData.email });
            setSuccessMessage('Link de verificação reenviado! Verifique seu email.');
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao reenviar email.');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                background: '#F8FAFC', // Clean solid premium background
                position: 'relative'
            }}
        >
            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
                <Card
                    elevation={0}
                    sx={{
                        borderRadius: 4,
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
                        p: { xs: 2, sm: 4 },
                        animation: 'fadeIn 0.6s ease-in-out',
                        backgroundColor: '#ffffff'
                    }}
                >
                    <CardContent sx={{ p: 0 }}>
                        <Box textAlign="center" mb={4}>
                            <Typography variant="h4" fontWeight={700} gutterBottom color="text.primary">
                                Seguro+
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Aceda à sua conta
                            </Typography>
                        </Box>

                        {successMessage && (
                            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                                {successMessage}
                            </Alert>
                        )}

                        {error && (
                            <Alert
                                severity="error"
                                sx={{ mb: 3, borderRadius: 2 }}
                                action={
                                    error.includes('Email não verificado') || error.includes('verifique') ? (
                                        <Button color="inherit" size="small" onClick={handleResendEmail} sx={{ fontWeight: 600 }}>
                                            Reenviar
                                        </Button>
                                    ) : null
                                }
                            >
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                margin="normal"
                                required
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email fontSize="small" sx={{ color: '#94A3B8' }} />
                                            </InputAdornment>
                                        ),
                                    }
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        backgroundColor: '#F8FAFC',
                                    }
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Senha"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                margin="normal"
                                required
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock fontSize="small" sx={{ color: '#94A3B8' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    size="small"
                                                    edge="end"
                                                    sx={{ color: '#94A3B8' }}
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        backgroundColor: '#F8FAFC',
                                    }
                                }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                disabled={loading}
                                variant="contained"
                                size="large"
                                sx={{
                                    mt: 4,
                                    py: 1.5,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    boxShadow: 'none',
                                }}
                            >
                                {loading ? 'A entrar...' : 'Entrar'}
                            </Button>
                        </form>

                        <Box textAlign="center" mt={4}>
                            <Typography variant="body2" color="text.secondary">
                                Não tem conta?{' '}
                                <Link
                                    to="/register"
                                    style={{
                                        color: '#2563EB',
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                    }}
                                >
                                    Registar
                                </Link>
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Container>

            <style>
                {`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                `}
            </style>
        </Box>
    );
};

export default Login;
