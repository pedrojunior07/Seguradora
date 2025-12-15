import { useState } from 'react';
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '@context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [perfil, setPerfil] = useState('cliente');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        // Seguradora/Corretora specific
        nome_empresa: '',
        nuit: '',
        endereco: '',
        licenca: '', // Only for corretora
        // Cliente specific
        tipo_cliente: 'fisica',
        nome_completo: '',
        documento: '',
        telefone1: '',
        telefone2: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handlePerfilChange = (e) => {
        setPerfil(e.target.value);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate password match
        if (formData.password !== formData.password_confirmation) {
            setError('As senhas não coincidem');
            return;
        }

        setLoading(true);

        try {
            // Build user data based on perfil
            let userData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                password_confirmation: formData.password_confirmation,
            };

            if (perfil === 'seguradora' || perfil === 'corretora') {
                userData = {
                    ...userData,
                    nome_empresa: formData.nome_empresa,
                    nuit: formData.nuit,
                    endereco: formData.endereco,
                };

                if (perfil === 'corretora') {
                    userData.licenca = formData.licenca;
                }
            } else if (perfil === 'cliente') {
                userData = {
                    ...userData,
                    tipo_cliente: formData.tipo_cliente,
                    nome_completo: formData.nome_completo,
                    nuit: formData.nuit,
                    documento: formData.documento,
                    endereco: formData.endereco,
                    telefone1: formData.telefone1,
                    telefone2: formData.telefone2,
                };
            }

            const data = await register(userData, perfil);

            // Redirect based on profile
            switch (perfil) {
                case 'seguradora':
                    navigate('/seguradora/dashboard');
                    break;
                case 'corretora':
                    navigate('/corretora/dashboard');
                    break;
                case 'cliente':
                    navigate('/cliente/dashboard');
                    break;
                default:
                    navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Falha no registro. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                py: 5,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
        >
            <Container maxWidth="md">
                <Card
                    elevation={24}
                    sx={{
                        borderRadius: 4,
                        backdropFilter: 'blur(10px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    }}
                >
                    <CardContent sx={{ p: 5 }}>
                        <Box textAlign="center" mb={4}>
                            <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
                                Criar Nova Conta
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Preencha os dados abaixo para se registrar
                            </Typography>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <FormControl fullWidth margin="normal" sx={{ mb: 3 }}>
                                <InputLabel>Tipo de Perfil</InputLabel>
                                <Select value={perfil} onChange={handlePerfilChange} label="Tipo de Perfil">
                                    <MenuItem value="cliente">Cliente</MenuItem>
                                    <MenuItem value="corretora">Corretora</MenuItem>
                                    <MenuItem value="seguradora">Seguradora</MenuItem>
                                </Select>
                            </FormControl>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Nome"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Senha"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Confirmar Senha"
                                        name="password_confirmation"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>

                                {(perfil === 'seguradora' || perfil === 'corretora') && (
                                    <>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Nome da Empresa"
                                                name="nome_empresa"
                                                value={formData.nome_empresa}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="NUIT"
                                                name="nuit"
                                                value={formData.nuit}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Endereço"
                                                name="endereco"
                                                value={formData.endereco}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Grid>
                                        {perfil === 'corretora' && (
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Licença"
                                                    name="licenca"
                                                    value={formData.licenca}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Grid>
                                        )}
                                    </>
                                )}

                                {perfil === 'cliente' && (
                                    <>
                                        <Grid item xs={12} md={6}>
                                            <FormControl fullWidth>
                                                <InputLabel>Tipo de Cliente</InputLabel>
                                                <Select
                                                    name="tipo_cliente"
                                                    value={formData.tipo_cliente}
                                                    onChange={handleChange}
                                                    label="Tipo de Cliente"
                                                >
                                                    <MenuItem value="fisica">Pessoa Física</MenuItem>
                                                    <MenuItem value="juridica">Pessoa Jurídica</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Nome Completo"
                                                name="nome_completo"
                                                value={formData.nome_completo}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="NUIT"
                                                name="nuit"
                                                value={formData.nuit}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Documento (BI/Passaporte)"
                                                name="documento"
                                                value={formData.documento}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Endereço"
                                                name="endereco"
                                                value={formData.endereco}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Telefone 1"
                                                name="telefone1"
                                                value={formData.telefone1}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Telefone 2"
                                                name="telefone2"
                                                value={formData.telefone2}
                                                onChange={handleChange}
                                            />
                                        </Grid>
                                    </>
                                )}
                            </Grid>

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{
                                    mt: 4,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #5568d3 0%, #6a4293 100%)',
                                    },
                                }}
                            >
                                {loading ? 'Registrando...' : 'Criar Conta'}
                            </Button>
                        </form>

                        <Box textAlign="center" mt={3}>
                            <Typography variant="body2" color="text.secondary">
                                Já tem uma conta?{' '}
                                <Link
                                    to="/login"
                                    style={{ color: '#667eea', fontWeight: 'bold', textDecoration: 'none' }}
                                >
                                    Faça login
                                </Link>
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default Register;
