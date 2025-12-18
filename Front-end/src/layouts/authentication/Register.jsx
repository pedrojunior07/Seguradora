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
    Fade,
    Grow,
    Zoom,
    Slide,
    Paper,
    Stepper,
    Step,
    StepLabel,
    Avatar,
    Divider,
    Chip,
    alpha,
    useTheme,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Person,
    Business,
    Shield,
    Badge,
    Email,
    Lock,
    Phone,
    LocationOn,
    Assignment,
    CheckCircle,
    ArrowForward,
    Security,
    Speed,
    Verified,
} from '@mui/icons-material';
import { useAuth } from '@context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const theme = useTheme();

    const [perfil, setPerfil] = useState('cliente');
    const [showPassword, setShowPassword] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        nome_empresa: '',
        nuit: '',
        endereco: '',
        licenca: '',
        tipo_cliente: 'fisica',
        nome_completo: '',
        documento: '',
        telefone1: '',
        telefone2: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const steps = ['Selecionar Perfil', 'Informações Básicas', 'Informações Adicionais'];

    const perfilOptions = [
        {
            value: 'cliente',
            label: 'Cliente',
            icon: <Person sx={{ fontSize: 40 }} />,
            color: '#1e40af',
            description: 'Contrate serviços de seguros'
        },
        {
            value: 'corretora',
            label: 'Corretora',
            icon: <Business sx={{ fontSize: 40 }} />,
            color: '#059669',
            description: 'Intermedie serviços de seguros'
        },
        {
            value: 'seguradora',
            label: 'Seguradora',
            icon: <Shield sx={{ fontSize: 40 }} />,
            color: '#d97706',
            description: 'Ofereça serviços de seguros'
        }
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.password_confirmation) {
            setError('As senhas não coincidem');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = await register(formData, perfil);
            setSuccess(true);

            setTimeout(() => {
                if (perfil === 'seguradora') navigate('/seguradora/dashboard');
                else if (perfil === 'corretora') navigate('/corretora/dashboard');
                else navigate('/cliente/dashboard');
            }, 2000);
        } catch (err) {
            console.error('Registration error:', err);

            // Extract error message from API response
            if (err.data?.message) {
                setError(err.data.message);
            } else if (err.data?.errors) {
                // Display validation errors
                const errorMessages = Object.values(err.data.errors).flat().join(', ');
                setError(errorMessages);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Erro ao criar conta. Verifique os dados e tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const renderPerfilStep = () => (
        <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
                Qual é o seu perfil?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Selecione o tipo de conta que melhor se adapta às suas necessidades
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                {perfilOptions.map((option, index) => (
                    <Grid item xs={12} md={4} key={option.value}>
                        <Grow in timeout={300 + (index * 100)}>
                            <Paper
                                onClick={() => setPerfil(option.value)}
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    cursor: 'pointer',
                                    border: perfil === option.value ? `2px solid ${option.color}` : '2px solid transparent',
                                    backgroundColor: perfil === option.value
                                        ? alpha(option.color, 0.08)
                                        : 'background.paper',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                                        backgroundColor: alpha(option.color, 0.05),
                                        borderColor: alpha(option.color, 0.3),
                                    },
                                }}
                                className="card-hover"
                            >
                                <Box sx={{
                                    width: 70,
                                    height: 70,
                                    borderRadius: '50%',
                                    backgroundColor: alpha(option.color, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 20px',
                                    color: option.color
                                }}>
                                    {option.icon}
                                </Box>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    {option.label}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {option.description}
                                </Typography>
                                {perfil === option.value && (
                                    <Zoom in>
                                        <Chip
                                            icon={<CheckCircle />}
                                            label="Selecionado"
                                            size="small"
                                            sx={{ mt: 2, backgroundColor: option.color, color: 'white' }}
                                        />
                                    </Zoom>
                                )}
                            </Paper>
                        </Grow>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );

    const renderBasicInfoStep = () => (
        <Fade in timeout={500}>
            <Box>
                <Grid container spacing={2.5}>
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person /> Informações Básicas
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Nome"
                            name="name"
                            onChange={handleChange}
                            required
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            onChange={handleChange}
                            required
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Senha"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            onChange={handleChange}
                            required
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
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
                            type="password"
                            onChange={handleChange}
                            required
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Fade>
    );

    const renderAdditionalInfoStep = () => (
        <Slide direction="up" in timeout={500}>
            <Box>
                {(perfil === 'seguradora' || perfil === 'corretora') && (
                    <>
                        <Typography variant="h6" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                            <Business /> Informações da Empresa
                        </Typography>
                        <Grid container spacing={2.5}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Nome da Empresa"
                                    name="nome_empresa"
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Business color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Nome do Responsável"
                                    name="nome_responsavel"
                                    onChange={handleChange}
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Person color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="NUIT"
                                    name="nuit"
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Badge color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Telefone Principal"
                                    name="telefone1"
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Phone color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Telefone Secundário"
                                    name="telefone2"
                                    onChange={handleChange}
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Phone color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={perfil === 'seguradora' ? 6 : 12}>
                                <TextField
                                    fullWidth
                                    label="Endereço"
                                    name="endereco"
                                    onChange={handleChange}
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LocationOn color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            {perfil === 'seguradora' && (
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Número da Licença"
                                        name="licenca"
                                        onChange={handleChange}
                                        variant="outlined"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Assignment color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </>
                )}

                {perfil === 'cliente' && (
                    <>
                        <Typography variant="h6" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                            <Person /> Informações Pessoais
                        </Typography>
                        <Grid container spacing={2.5}>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Tipo de Cliente</InputLabel>
                                    <Select
                                        name="tipo_cliente"
                                        label="Tipo de Cliente"
                                        onChange={handleChange}
                                        defaultValue="fisica"
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
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Person color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="NUIT"
                                    name="nuit"
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Badge color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Documento (BI/Passaporte)"
                                    name="documento"
                                    onChange={handleChange}
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Assignment color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Telefone"
                                    name="telefone1"
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Phone color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Endereço"
                                    name="endereco"
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LocationOn color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </>
                )}
            </Box>
        </Slide>
    );

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 50%, #172554 100%)',
                backgroundSize: '400% 400%',
                animation: 'gradient 15s ease infinite',
                py: 4,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Elementos decorativos */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-10%',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                    animation: 'float 20s ease-in-out infinite',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '-15%',
                    left: '-10%',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)',
                    animation: 'float 25s ease-in-out infinite reverse',
                }}
            />

            <Container maxWidth="lg">
                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Fade in timeout={800}>
                            <Box sx={{ color: 'white', textAlign: { xs: 'center', md: 'left' } }}>
                                <Typography
                                    variant="h1"
                                    fontWeight={800}
                                    gutterBottom
                                    sx={{
                                        fontSize: { xs: '2.5rem', md: '3.5rem' },
                                        textShadow: '0 2px 20px rgba(0,0,0,0.2)',
                                        mb: 3,
                                    }}
                                >
                                    Transforme sua <Box component="span" sx={{ color: '#60a5fa' }}>experiência</Box> em seguros
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 4 }}>
                                    {[
                                        { icon: <Security />, text: 'Segurança de nível bancário', subtext: 'Proteção avançada para seus dados' },
                                        { icon: <Speed />, text: 'Processos ágeis', subtext: 'Gestão simplificada e eficiente' },
                                        { icon: <Verified />, text: 'Plataforma certificada', subtext: 'Conformidade com regulamentações' },
                                    ].map((item, index) => (
                                        <Grow in timeout={1000 + (index * 200)} key={index}>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: 2,
                                                backgroundColor: 'rgba(255,255,255,0.08)',
                                                p: 2,
                                                borderRadius: 2,
                                                backdropFilter: 'blur(10px)',
                                            }}>
                                                <Box sx={{
                                                    p: 1,
                                                    borderRadius: '50%',
                                                    backgroundColor: 'rgba(255,255,255,0.15)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                    {item.icon}
                                                </Box>
                                                <Box>
                                                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                                                        {item.text}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                        {item.subtext}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grow>
                                    ))}
                                </Box>

                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                                    {[
                                        { number: '99%', label: 'Satisfação' },
                                        { number: '24/7', label: 'Suporte' },
                                        { number: '10K+', label: 'Usuários' },
                                    ].map((stat, index) => (
                                        <Zoom in timeout={1200 + (index * 200)} key={index}>
                                            <Box sx={{
                                                textAlign: 'center',
                                                p: 2,
                                                minWidth: '100px',
                                                backgroundColor: 'rgba(255,255,255,0.1)',
                                                borderRadius: 2,
                                                backdropFilter: 'blur(10px)',
                                            }}>
                                                <Typography variant="h4" fontWeight={700}>
                                                    {stat.number}
                                                </Typography>
                                                <Typography variant="body2">
                                                    {stat.label}
                                                </Typography>
                                            </Box>
                                        </Zoom>
                                    ))}
                                </Box>
                            </Box>
                        </Fade>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Slide direction="up" in timeout={600}>
                            <Card
                                sx={{
                                    borderRadius: 4,
                                    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                                    overflow: 'hidden',
                                    background: 'rgba(255, 255, 255, 0.97)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    position: 'relative',
                                    zIndex: 1,
                                }}
                            >
                                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                                    <Box textAlign="center" mb={3}>
                                        <Avatar
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                margin: '0 auto 16px',
                                                background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                                                animation: 'pulse 2s infinite',
                                            }}
                                        >
                                            <Badge sx={{ fontSize: 40 }} />
                                        </Avatar>
                                        <Typography variant="h4" fontWeight={700} gutterBottom>
                                            Comece Agora
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            Cadastre-se em menos de 2 minutos
                                        </Typography>
                                    </Box>

                                    {success ? (
                                        <Box textAlign="center" py={4}>
                                            <CheckCircle sx={{ fontSize: 80, color: '#10b981', mb: 2 }} />
                                            <Typography variant="h5" gutterBottom fontWeight={600}>
                                                Conta criada com sucesso!
                                            </Typography>
                                            <Typography color="text.secondary">
                                                Redirecionando para o dashboard...
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <>
                                            <Stepper
                                                activeStep={activeStep}
                                                sx={{
                                                    mb: 4,
                                                    '& .MuiStepIcon-root.Mui-active': {
                                                        color: '#1e40af',
                                                    },
                                                    '& .MuiStepIcon-root.Mui-completed': {
                                                        color: '#10b981',
                                                    },
                                                }}
                                            >
                                                {steps.map((label, index) => (
                                                    <Step key={label}>
                                                        <StepLabel>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {label}
                                                            </Typography>
                                                        </StepLabel>
                                                    </Step>
                                                ))}
                                            </Stepper>

                                            {error && (
                                                <Zoom in>
                                                    <Alert
                                                        severity="error"
                                                        sx={{
                                                            mb: 3,
                                                            borderRadius: 2,
                                                            animation: 'shake 0.5s ease-in-out',
                                                        }}
                                                        icon={<Security />}
                                                    >
                                                        {error}
                                                    </Alert>
                                                </Zoom>
                                            )}

                                            <form onSubmit={handleSubmit}>
                                                {activeStep === 0 && renderPerfilStep()}
                                                {activeStep === 1 && renderBasicInfoStep()}
                                                {activeStep === 2 && renderAdditionalInfoStep()}

                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, gap: 2 }}>
                                                    <Button
                                                        onClick={handleBack}
                                                        disabled={activeStep === 0 || loading}
                                                        variant="outlined"
                                                        sx={{
                                                            visibility: activeStep === 0 ? 'hidden' : 'visible',
                                                            minWidth: '120px',
                                                            borderRadius: 2,
                                                        }}
                                                    >
                                                        Voltar
                                                    </Button>

                                                    {activeStep === steps.length - 1 ? (
                                                        <Button
                                                            type="submit"
                                                            variant="contained"
                                                            disabled={loading}
                                                            endIcon={<ArrowForward />}
                                                            sx={{
                                                                px: 4,
                                                                py: 1.2,
                                                                borderRadius: 2,
                                                                fontWeight: 600,
                                                                textTransform: 'none',
                                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                '&:hover': {
                                                                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                                                                    transform: 'translateY(-2px)',
                                                                    boxShadow: '0 15px 30px rgba(102, 126, 234, 0.4)',
                                                                },
                                                                transition: 'all 0.3s ease',
                                                                minWidth: '180px',
                                                            }}
                                                        >
                                                            {loading ? (
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Box
                                                                        sx={{
                                                                            width: 16,
                                                                            height: 16,
                                                                            borderRadius: '50%',
                                                                            border: '2px solid',
                                                                            borderColor: 'white transparent transparent transparent',
                                                                            animation: 'spin 1s linear infinite'
                                                                        }}
                                                                    />
                                                                    Criando conta...
                                                                </Box>
                                                            ) : 'Finalizar Cadastro'}
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="contained"
                                                            onClick={handleNext}
                                                            endIcon={<ArrowForward />}
                                                            sx={{
                                                                px: 4,
                                                                py: 1.2,
                                                                borderRadius: 2,
                                                                fontWeight: 600,
                                                                textTransform: 'none',
                                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                '&:hover': {
                                                                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                                                                    transform: 'translateY(-2px)',
                                                                    boxShadow: '0 15px 30px rgba(102, 126, 234, 0.4)',
                                                                },
                                                                transition: 'all 0.3s ease',
                                                                minWidth: '120px',
                                                            }}
                                                        >
                                                            Próximo
                                                        </Button>
                                                    )}
                                                </Box>
                                            </form>

                                            <Divider sx={{ my: 3 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Já tem conta?
                                                </Typography>
                                            </Divider>

                                            <Box textAlign="center">
                                                <Button
                                                    component={Link}
                                                    to="/login"
                                                    variant="outlined"
                                                    fullWidth
                                                    sx={{
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        py: 1.2,
                                                        borderColor: '#667eea',
                                                        color: '#667eea',
                                                        '&:hover': {
                                                            borderColor: '#5a67d8',
                                                            backgroundColor: 'rgba(102, 126, 234, 0.04)',
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 5px 15px rgba(102, 126, 234, 0.2)',
                                                        },
                                                        transition: 'all 0.3s ease',
                                                    }}
                                                >
                                                    Acessar Minha Conta
                                                </Button>
                                            </Box>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </Slide>
                    </Grid>
                </Grid>
            </Container>

            <style>
                {`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    33% { transform: translate(30px, -50px) rotate(120deg); }
                    66% { transform: translate(-20px, 20px) rotate(240deg); }
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                
                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7); }
                    70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(102, 126, 234, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .card-hover {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .card-hover:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
                }
                
                .gradient-text {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                `}
            </style>
        </Box>
    );
};

export default Register;
