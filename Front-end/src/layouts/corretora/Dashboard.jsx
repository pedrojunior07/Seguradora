import { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Typography, Toolbar, Button } from '@mui/material';
import {
    Assignment,
    Check,
    TrendingUp,
    Description as DescriptionIcon,
    History as HistoryIcon
} from '@mui/icons-material';
import { SafetyCertificateOutlined, ArrowRightOutlined, LoadingOutlined } from '@ant-design/icons';
// Navbar removed
// Sidebar removed
import PremiumStatCard from './components/PremiumStatCard';
import corretoraService from '@services/corretora.service';
import { drawerWidth } from '@components/Sidebar';
import { Modal, Typography as TypographyAntd, Button as ButtonAntd, Alert } from 'antd';
import { useAuth } from '@context/AuthContext';

import { useNavigate } from 'react-router-dom';

const { Paragraph } = TypographyAntd;

const menuItems = [
    { name: 'Dashboard', route: '/corretora/dashboard', icon: <TrendingUp />, key: 'dashboard' },
    {
        name: 'Propostas',
        route: '/corretora/proposals',
        icon: <Assignment />,
        key: 'proposals',
    },
    {
        name: 'Nova Proposta',
        route: '/corretora/proposals/create',
        icon: <DescriptionIcon />,
        key: 'create',
    },
    {
        name: 'Verificação de Conta',
        route: '/corretora/perfil/verificacao',
        icon: <SafetyCertificateOutlined />,
        key: 'verificacao',
    },
];

const CorretoraDashboard = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalProposals: 0,
        pendingProposals: 0,
        approvedProposals: 0,
        convertedPolicies: 0,
    });
    const [loading, setLoading] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState(null);
    const navigate = useNavigate();

    // Event listener for verification errors
    useEffect(() => {
        const handleNotVerified = (event) => {
            Modal.warning({
                title: 'Ação Necessária: Verificação de Corretora',
                icon: <SafetyCertificateOutlined style={{ color: '#faad14' }} />,
                content: (
                    <div style={{ marginTop: '16px' }}>
                        <div style={{ marginBottom: '12px' }}>
                            <span style={{ fontSize: '15px', color: '#1e293b', fontWeight: 500 }}>
                                {event.detail.message}
                            </span>
                        </div>
                        <span style={{ color: '#64748b', fontSize: '13px' }}>
                            Como Corretora, você deve submeter sua documentação para análise antes de emitir propostas ou gerenciar apólices.
                        </span>
                    </div>
                ),
                okText: 'Submeter Documentos',
                onOk: () => {
                    navigate('/corretora/perfil/verificacao');
                },
                width: 500,
                centered: true,
                okButtonProps: {
                    icon: <ArrowRightOutlined />,
                    style: { borderRadius: '12px', height: '44px', fontWeight: 600, background: '#1e293b', boxShadow: '0 4px 12px rgba(30, 41, 59, 0.2)' }
                }
            });
        };

        window.addEventListener('entity-not-verified', handleNotVerified);
        return () => window.removeEventListener('entity-not-verified', handleNotVerified);
    }, [navigate]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [proposals, vStatus] = await Promise.all([
                corretoraService.getProposals(),
                corretoraService.getVerificacaoStatus()
            ]);
            
            setVerificationStatus(vStatus);
            const data = proposals.data || [];

            setStats({
                totalProposals: data.length,
                pendingProposals: data.filter((p) => p.status === 'pendente').length,
                approvedProposals: data.filter((p) => p.status === 'aprovada').length,
                convertedPolicies: data.filter((p) => p.status === 'convertida').length,
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const getCurrentDateFormatted = () => {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return new Date().toLocaleDateString('pt-BR', options);
    };

    return (
        <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '24px' }}>
            {/* Navbar removed */}
            {/* Sidebar removed */}

            {/* Box main removed */}









                <Container maxWidth="xl" sx={{ mt: 2 }}>
                    {/* Premium Header/Greeting */}
                    <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 1, letterSpacing: '-0.02em' }}>
                                Olá, {user?.name || 'Corretor'}! 👋
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
                                {getCurrentDateFormatted()} • Bem-vindo de volta ao seu painel.
                            </Typography>
                        </Box>
                        <Button 
                            variant="contained" 
                            startIcon={<DescriptionIcon />}
                            onClick={() => navigate('/corretora/proposals/create')}
                            sx={{ 
                                bgcolor: '#1e293b', 
                                color: 'white', 
                                px: 3, 
                                py: 1.5, 
                                borderRadius: '14px',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                '&:hover': { bgcolor: '#334155' },
                                boxShadow: '0 4px 14px rgba(30, 41, 59, 0.15)'
                            }}
                        >
                            Nova Proposta
                        </Button>
                    </Box>

                    {verificationStatus?.status_verificacao !== 'aprovado' && (
                        <Alert
                            message={
                                <span style={{ fontWeight: 800, fontSize: '16px', color: '#1e293b' }}>
                                    {verificationStatus?.status_verificacao === 'pendente' 
                                        ? 'Verificação em Análise' 
                                        : 'Ação Necessária: Verificação de Corretora'}
                                </span>
                            }
                            description={
                                <div style={{ marginTop: '8px' }}>
                                    <Paragraph style={{ color: '#475569', marginBottom: '20px', fontSize: '14px', lineHeight: 1.6 }}>
                                        {verificationStatus?.status_verificacao === 'pendente'
                                            ? 'Seus documentos foram enviados e estão sendo analisados pela nossa equipe. Você poderá emitir propostas assim que o processo for concluído.'
                                            : 'Sua conta de corretora ainda não possui as permissões necessárias. Para começar a operar na plataforma, realize o envio dos seus documentos de identificação e registro profissional.'}
                                    </Paragraph>
                                    {verificationStatus?.status_verificacao !== 'pendente' && (
                                        <ButtonAntd 
                                            type="primary" 
                                            icon={<ArrowRightOutlined />}
                                            onClick={() => navigate('/corretora/perfil/verificacao')}
                                            style={{ 
                                                borderRadius: '10px', 
                                                background: '#1e293b', 
                                                borderColor: '#1e293b',
                                                height: '40px',
                                                fontWeight: 600,
                                                padding: '0 20px'
                                            }}
                                        >
                                            Iniciar Verificação
                                        </ButtonAntd>
                                    )}
                                </div>
                            }
                            type="warning"
                            showIcon
                            icon={<SafetyCertificateOutlined style={{ fontSize: '24px', color: '#f59e0b' }} />}
                            style={{ 
                                marginBottom: '40px', 
                                padding: '24px', 
                                borderRadius: '24px', 
                                border: '1px solid #fef3c7',
                                backgroundColor: '#fffbeb',
                                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.05)'
                            }}
                        />
                    )}

                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" py={10}>
                            <LoadingOutlined style={{ fontSize: 40, color: '#1e293b' }} spin />
                        </Box>
                    ) : (
                        <>
                            <Grid container spacing={3} mb={5}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <PremiumStatCard
                                        title="Total de Propostas"
                                        value={stats.totalProposals}
                                        icon={Assignment}
                                        color="#2563EB"
                                        percentage="12"
                                        trend="up"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <PremiumStatCard
                                        title="Propostas Pendentes"
                                        value={stats.pendingProposals}
                                        icon={HistoryIcon}
                                        color="#F59E0B"
                                        percentage="5"
                                        trend="down"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <PremiumStatCard
                                        title="Propostas Aprovadas"
                                        value={stats.approvedProposals}
                                        icon={Check}
                                        color="#10B981"
                                        percentage="8"
                                        trend="up"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <PremiumStatCard
                                        title="Apólices Convertidas"
                                        value={stats.convertedPolicies}
                                        icon={TrendingUp}
                                        color="#6366F1"
                                        percentage="15"
                                        trend="up"
                                    />
                                </Grid>
                            </Grid>

                            <Grid container spacing={4}>
                                <Grid item xs={12} md={8}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 4,
                                            borderRadius: '24px',
                                            height: '450px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            bgcolor: 'white',
                                            border: '1px solid rgba(0, 0, 0, 0.04)',
                                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
                                        }}
                                    >
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                                Análise de Produtividade
                                            </Typography>
                                            <Button size="small" sx={{ textTransform: 'none', fontWeight: 600, color: '#64748b' }}>
                                                Ver Detalhes
                                            </Button>
                                        </Box>
                                        <Box flex={1} display="flex" alignItems="center" justifyContent="center" sx={{ bgcolor: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
                                            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                                                📊 Gráfico de evolução de propostas será exibido aqui
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Paper 
                                        elevation={0}
                                        sx={{ 
                                            p: 4, 
                                            borderRadius: '24px', 
                                            height: '450px', 
                                            bgcolor: 'white',
                                            border: '1px solid rgba(0, 0, 0, 0.04)',
                                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}
                                    >
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                                Atividade Recente
                                            </Typography>
                                            <HistoryIcon sx={{ color: '#94a3b8' }} />
                                        </Box>
                                        <Box flex={1} display="flex" flexDirection="column" gap={3} sx={{ overflow: 'auto' }}>
                                            <Box sx={{ borderBottom: '1px solid #f1f5f9', pb: 2 }}>
                                                <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>Sem atividades recentes para exibir</Typography>
                                                <Typography variant="caption" sx={{ color: '#94a3b8' }}>Acompanhe aqui o histórico de ações.</Typography>
                                            </Box>
                                            {/* Placeholders for future activity items */}
                                            <Box sx={{ opacity: 0.4 }}>
                                                <Box sx={{ width: '40%', height: '12px', bgcolor: '#e2e8f0', borderRadius: '4px', mb: 1 }} />
                                                <Box sx={{ width: '70%', height: '10px', bgcolor: '#f1f5f9', borderRadius: '4px' }} />
                                            </Box>
                                            <Box sx={{ opacity: 0.3 }}>
                                                <Box sx={{ width: '50%', height: '12px', bgcolor: '#e2e8f0', borderRadius: '4px', mb: 1 }} />
                                                <Box sx={{ width: '60%', height: '10px', bgcolor: '#f1f5f9', borderRadius: '4px' }} />
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </>
                    )}
                </Container>
            {/* Box removed */}
        </div>
    );
};

export default CorretoraDashboard;
