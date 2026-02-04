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
    Badge,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Person,
    Business,
    Shield,
    Badge as BadgeIcon,
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
    CloudUpload,
} from '@mui/icons-material';
import { useAuth } from '@context/AuthContext';
import { Card as AntCard, Row, Col, Typography as AntTypography, Badge as AntBadge } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';

const { Title, Paragraph } = AntTypography;

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
        tipo_empresa: '', // Novo para cliente juridica
        nome_completo: '',
        documento: '',
        telefone1: '',
        telefone2: '',
    });
    const [logoFile, setLogoFile] = useState(null);
    // Estados para arquivos de cliente juridica
    const [clientFiles, setClientFiles] = useState({
        upload_nuit: null,
        upload_doc_representante: null,
        upload_certidao_comercial: null,
        upload_licenca: null,
        upload_br: null
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
            let payload;



            const isClienteJuridica = perfil === 'cliente' && formData.tipo_cliente === 'juridica';
            const hasFiles = (perfil === 'seguradora' && logoFile) || (isClienteJuridica);

            if (hasFiles) {
                payload = new FormData();
                Object.entries(formData).forEach(([k, v]) => {
                    if (v !== undefined && v !== null) payload.append(k, v);
                });
                payload.append('perfil', perfil);

                if (perfil === 'seguradora' && logoFile) {
                    payload.append('logo', logoFile);
                }

                if (isClienteJuridica) {
                    Object.entries(clientFiles).forEach(([key, file]) => {
                        if (file) payload.append(key, file);
                    });
                }
            } else {
                payload = { ...formData, perfil };
            }

            const data = await register(payload, perfil);
            setSuccess(true);

            setTimeout(() => {
                navigate('/login');
            }, 3000);
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

    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
    };

    const renderPerfilStep = () => (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Title level={2} style={{
                marginBottom: '48px',
                background: 'linear-gradient(45deg, #1e40af, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800
            }}>
                Como deseja se cadastrar?
            </Title>



            <Row gutter={[24, 24]} justify="center">
                {perfilOptions.map((option) => {
                    const isSelected = perfil === option.value;
                    return (
                        <Col xs={24} sm={12} md={8} key={option.value}>
                            <AntBadge.Ribbon
                                text={isSelected ? "Selecionado" : ""}
                                color={option.color}
                                style={{ display: isSelected ? 'block' : 'none' }}
                            >
                                <AntCard
                                    hoverable
                                    onClick={() => setPerfil(option.value)}
                                    style={{
                                        height: '100%',
                                        borderRadius: '16px',
                                        borderColor: isSelected ? option.color : 'transparent',
                                        borderWidth: isSelected ? '2px' : '1px',
                                        background: isSelected
                                            ? `linear-gradient(135deg, ${alpha(option.color, 0.04)} 0%, ${alpha(option.color, 0.1)} 100%)`
                                            : '#ffffff',
                                        transition: 'all 0.3s ease',
                                        transform: isSelected ? 'translateY(-4px)' : 'none',
                                        boxShadow: isSelected
                                            ? `0 12px 24px ${alpha(option.color, 0.15)}`
                                            : '0 4px 12px rgba(0,0,0,0.05)'
                                    }}
                                    bodyStyle={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        padding: '24px',
                                        textAlign: 'left'
                                    }}
                                >
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        background: `linear-gradient(135deg, ${alpha(option.color, 0.1)} 0%, ${alpha(option.color, 0.2)} 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '20px',
                                        flexShrink: 0,
                                        color: option.color
                                    }}>
                                        {option.icon}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <Title level={4} style={{ marginBottom: '4px', color: '#1e293b', fontSize: '18px' }}>
                                            {option.label}
                                        </Title>
                                        <Paragraph type="secondary" style={{ marginBottom: 0, fontSize: '14px', lineHeight: '1.4' }}>
                                            {option.description}
                                        </Paragraph>
                                    </div>

                                    <div style={{ marginLeft: '16px' }}>
                                        {isSelected ? (
                                            <CheckCircleFilled style={{ fontSize: '24px', color: option.color }} />
                                        ) : (
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                border: '2px solid #e2e8f0'
                                            }} />
                                        )}
                                    </div>
                                </AntCard>
                            </AntBadge.Ribbon>
                        </Col>
                    );
                })}
            </Row>
        </div>
    );

    const renderBasicInfoStep = () => (
        <Fade in timeout={500}>
            <Box>
                {perfil === 'cliente' && (
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Button
                            variant="outlined"
                            startIcon={<img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google" style={{ width: 24, height: 24 }} />}
                            onClick={handleGoogleLogin}
                            sx={{
                                py: 1.5,
                                px: 4,
                                borderRadius: 50,
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 500,
                                color: '#333',
                                borderColor: '#ddd',
                                '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                    borderColor: '#ccc'
                                }
                            }}
                        >
                            Continuar com Google
                        </Button>
                        <Divider sx={{ my: 3 }}>OU</Divider>
                    </Box>
                )}

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
                                                <BadgeIcon color="action" />
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
                            {perfil === 'seguradora' && (
                                <Grid item xs={12} md={6}>
                                    <div>
                                        <InputLabel sx={{ mb: 1 }}>Logo da Seguradora (opcional)</InputLabel>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setLogoFile(e.target.files[0] ?? null)}
                                        />
                                    </div>
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
                                        <MenuItem value="juridica">Pessoa Jurídica (Empresa)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {formData.tipo_cliente === 'juridica' && (
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Tipo de Empresa (ex: Lda, SA)"
                                        name="tipo_empresa"
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
                            )}
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
                                                <BadgeIcon color="action" />
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


                            {formData.tipo_cliente === 'juridica' && (
                                <>
                                    <Grid item xs={12}>
                                        <Typography variant="h6" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3 }}>
                                            <Assignment /> Documentos da Empresa
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <InputLabel>Cópia do NUIT</InputLabel>
                                        <input
                                            type="file"
                                            accept=".pdf,image/*"
                                            onChange={(e) => setClientFiles({ ...clientFiles, upload_nuit: e.target.files[0] })}
                                            style={{ marginTop: 8 }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <InputLabel>Documento do Representante</InputLabel>
                                        <input
                                            type="file"
                                            accept=".pdf,image/*"
                                            onChange={(e) => setClientFiles({ ...clientFiles, upload_doc_representante: e.target.files[0] })}
                                            style={{ marginTop: 8 }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <InputLabel>Certidão Comercial</InputLabel>
                                        <input
                                            type="file"
                                            accept=".pdf,image/*"
                                            onChange={(e) => setClientFiles({ ...clientFiles, upload_certidao_comercial: e.target.files[0] })}
                                            style={{ marginTop: 8 }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <InputLabel>Licença (Alvará)</InputLabel>
                                        <input
                                            type="file"
                                            accept=".pdf,image/*"
                                            onChange={(e) => setClientFiles({ ...clientFiles, upload_licenca: e.target.files[0] })}
                                            style={{ marginTop: 8 }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <InputLabel>Boletim da República (Opcional)</InputLabel>
                                        <input
                                            type="file"
                                            accept=".pdf,image/*"
                                            onChange={(e) => setClientFiles({ ...clientFiles, upload_br: e.target.files[0] })}
                                            style={{ marginTop: 8 }}
                                        />
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </>
                )}
            </Box>
        </Slide >
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

            <Container maxWidth="xl">
                <Grid container spacing={4} alignItems="center" justifyContent="center">


                    <Grid item xs={12} md={10}>
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
                                            <BadgeIcon sx={{ fontSize: 40 }} />
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
                                                Verifique seu email para ativar a conta.
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                Redirecionando para o login...
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
