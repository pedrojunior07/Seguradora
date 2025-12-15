import { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Typography, Toolbar } from '@mui/material';
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
import { drawerWidth } from '@components/Sidebar';

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
    const [mobileOpen, setMobileOpen] = useState(false);
    const [stats, setStats] = useState({
        pendingPolicies: 0,
        activePolicies: 0,
        pendingClaims: 0,
        totalRevenue: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [pending, active, claims] = await Promise.all([
                seguradoraService.getPendingPolicies(),
                seguradoraService.getActivePolicies(),
                seguradoraService.getPendingClaims(),
            ]);

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

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Navbar title="Dashboard - Seguradora" onMenuClick={handleDrawerToggle} />
            <Sidebar items={menuItems} mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    backgroundColor: '#f5f5f5',
                    minHeight: '100vh',
                }}
            >
                <Toolbar />
                <Container maxWidth="xl">
                    <Typography variant="h4" fontWeight="bold" mb={4} mt={2}>
                        Visão Geral
                    </Typography>

                    <Grid container spacing={3} mb={4}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Apólices Pendentes"
                                value={stats.pendingPolicies}
                                icon={Warning}
                                bgColor="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Apólices Ativas"
                                value={stats.activePolicies}
                                icon={CheckCircle}
                                bgColor="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Sinistros Pendentes"
                                value={stats.pendingClaims}
                                icon={Description}
                                bgColor="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Receita Total"
                                value={`${stats.totalRevenue.toLocaleString()} MT`}
                                icon={TrendingUp}
                                bgColor="linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Paper
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    height: '400px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Typography variant="h6" color="text.secondary">
                                    Gráfico de tendências será exibido aqui
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, borderRadius: 3, height: '400px' }}>
                                <Typography variant="h6" fontWeight="bold" mb={2}>
                                    Atividades Recentes
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Últimas atividades do sistema serão exibidas aqui
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
};

export default SeguradoraDashboard;
