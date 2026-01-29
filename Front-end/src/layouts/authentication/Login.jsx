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
                background: 'linear-gradient(135deg, #eef2ff, #f8fafc)',
            }}
        >
            <Container maxWidth="sm">
                <Card
                    sx={{
                        borderRadius: 3,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                        animation: 'fadeIn 0.6s ease-in-out',
                    }}
                >
                    <CardContent sx={{ p: 4 }}>
                        <Box textAlign="center" mb={3}>
                            <Box
                                sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px',
                                    color: 'white'
                                }}
                            >
                                <Lock fontSize="large" />
                            </Box>
                            <Typography variant="h4" fontWeight={700} gutterBottom color="#1e3a8a">
                                Seguro+
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Bem-vindo ao seu portal de seguros
                            </Typography>
                        </Box>

                        {successMessage && (
                            <Alert severity="success" sx={{ mb: 2 }}>
                                {successMessage}
                            </Alert>
                        )}

                        {error && (
                            <Alert
                                severity="error"
                                sx={{ mb: 2 }}
                                action={
                                    error.includes('Email não verificado') || error.includes('verifique') ? (
                                        <Button color="inherit" size="small" onClick={handleResendEmail}>
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
                                value={formData.email}
                                onChange={handleChange}
                                margin="normal"
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email fontSize="small" sx={{ color: '#1e40af' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': { borderColor: '#1e40af' },
                                        '&.Mui-focused fieldset': { borderColor: '#1e40af' },
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
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock fontSize="small" sx={{ color: '#1e40af' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                size="small"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': { borderColor: '#1e40af' },
                                        '&.Mui-focused fieldset': { borderColor: '#1e40af' },
                                    }
                                }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                disabled={loading}
                                sx={{
                                    mt: 3,
                                    py: 1.5,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    backgroundColor: '#1e40af',
                                    boxShadow: '0 4px 14px 0 rgba(30, 64, 175, 0.39)',
                                    '&:hover': {
                                        backgroundColor: '#1e3a8a',
                                        boxShadow: '0 6px 20px rgba(30, 64, 175, 0.23)'
                                    },
                                }}
                            >
                                {loading ? 'Entrando...' : 'Acessar Conta'}
                            </Button>
                        </form>

                        <Box textAlign="center" mt={3}>
                            <Typography variant="body2" color="text.secondary">
                                Não tem uma conta?{' '}
                                <Link
                                    to="/register"
                                    style={{
                                        color: '#1e40af',
                                        fontWeight: 500,
                                        textDecoration: 'none',
                                    }}
                                >
                                    Criar conta
                                </Link>
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Container>

            {/* animação */}
            <style>
                {`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                `}
            </style>
        </Box>
    );
};

export default Login;
