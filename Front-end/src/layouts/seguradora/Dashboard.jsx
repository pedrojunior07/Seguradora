import { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Description,
    CheckCircle,
    Warning,
    TrendingUp,
} from '@mui/icons-material';
import Navbar from '@components/Navbar';
import Sidebar from '@components/Sidebar';
import StatCard from '@components/StatCard';
import seguradoraService from '@services/seguradora.service';
import { Alert, Button, Space } from 'antd';
import { SafetyCertificateOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
const menuItems = [
    { name: 'Dashboard', route: '/seguradora/dashboard', icon: <DashboardIcon />, key: 'dashboard' },
    {
        name: 'Apólices Pendentes',
        route: '/seguradora/policies/pending',
        icon: <Warning />,
        key: 'pending',
    },
    {
        name: 'Apólices Ativas',
        route: '/seguradora/policies/active',
        icon: <CheckCircle />,
        key: 'active',
    },
    {
        name: 'Sinistros',
        route: '/seguradora/claims',
        icon: <Description />,
        key: 'claims',
    },
];

const SeguradoraDashboard = () => {
    const [stats, setStats] = useState({
        pendingPolicies: 0,
        activePolicies: 0,
        pendingClaims: 0,
        totalRevenue: 0,
    });
    const [loading, setLoading] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [pending, active, claims, vStatus] = await Promise.all([
                seguradoraService.getPendingPolicies(),
                seguradoraService.getActivePolicies(),
                seguradoraService.getPendingClaims(),
                seguradoraService.getVerificacaoStatus(),
            ]);

            setVerificationStatus(vStatus);

            setStats({
                pendingPolicies: pending.data?.length || 0,
                activePolicies: active.data?.length || 0,
                pendingClaims: claims.data?.length || 0,
                totalRevenue: active.data?.reduce((sum, p) => sum + (p.premio || 0), 0) || 0,
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="page-container">
            <Container maxWidth="xl">
                    {verificationStatus?.status_verificacao !== 'aprovado' && (
                        <Alert
                            message={
                                <span style={{ fontWeight: 700, fontSize: '16px', color: '#856404' }}>
                                    {verificationStatus?.status_verificacao === 'pendente' 
                                        ? 'Verificação em Análise' 
                                        : 'Ação Necessária: Verificação de Conta'}
                                </span>
                            }
                            description={
                                <div style={{ marginTop: '8px' }}>
                                    <Typography variant="body2" sx={{ color: '#856404', mb: 2 }}>
                                        {verificationStatus?.status_verificacao === 'pendente'
                                            ? 'Seus documentos foram enviados e estão sendo analisados pelo Super Admin. Você poderá vender seguros assim que for aprovado.'
                                            : 'Sua conta ainda não foi verificada. Para começar a vender seus serviços e gerenciar apólices, você precisa enviar seus documentos de legitimidade.'}
                                    </Typography>
                                    {verificationStatus?.status_verificacao !== 'pendente' && (
                                        <Button 
                                            type="primary" 
                                            icon={<ArrowRightOutlined />}
                                            onClick={() => navigate('/seguradora/perfil/verificacao')}
                                            style={{ borderRadius: '8px', background: '#856404', borderColor: '#856404' }}
                                        >
                                            Ir para Verificação
                                        </Button>
                                    )}
                                </div>
                            }
                            type="warning"
                            showIcon
                            icon={<SafetyCertificateOutlined style={{ fontSize: '24px' }} />}
                            style={{ 
                                marginBottom: '24px', 
                                padding: '20px', 
                                borderRadius: '16px', 
                                border: '1px solid #ffeeba',
                                backgroundColor: '#fff3cd'
                            }}
                        />
                    )}

                    <Typography variant="h5" fontWeight="600" sx={{ color: '#0F172A' }} mb={3} mt={2}>
                        Visão Geral
                    </Typography>

                    <Grid container spacing={3} mb={4}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Apólices Pendentes"
                                value={stats.pendingPolicies}
                                icon={Warning}
                                bgColor="#F59E0B"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Apólices Ativas"
                                value={stats.activePolicies}
                                icon={CheckCircle}
                                bgColor="#10B981"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Sinistros Pendentes"
                                value={stats.pendingClaims}
                                icon={Description}
                                bgColor="#EF4444"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Receita (Mensal)"
                                value={`${stats.totalRevenue.toLocaleString()} MT`}
                                icon={TrendingUp}
                                bgColor="#3B82F6"
                            />
                        </Grid>
                    </Grid>

            </Container>
        </div>
    );
};

export default SeguradoraDashboard;
