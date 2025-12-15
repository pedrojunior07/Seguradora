import { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Typography, Toolbar } from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Assignment,
    AddBox,
    Check,
} from '@mui/icons-material';
import Navbar from '@components/Navbar';
import Sidebar from '@components/Sidebar';
import StatCard from '@components/StatCard';
import corretoraService from '@services/corretora.service';
import { drawerWidth } from '@components/Sidebar';

const menuItems = [
    { name: 'Dashboard', route: '/corretora/dashboard', icon: <DashboardIcon />, key: 'dashboard' },
    {
        name: 'Propostas',
        route: '/corretora/proposals',
        icon: <Assignment />,
        key: 'proposals',
    },
    {
        name: 'Nova Proposta',
        route: '/corretora/proposals/create',
        icon: <AddBox />,
        key: 'create',
    },
];

const CorretoraDashboard = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [stats, setStats] = useState({
        totalProposals: 0,
        pendingProposals: 0,
        approvedProposals: 0,
        convertedPolicies: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const proposals = await corretoraService.getProposals();
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

    return (
        <Box sx={{ display: 'flex' }}>
            <Navbar title="Dashboard- Corretora" onMenuClick={handleDrawerToggle} />
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
                                title="Total de Propostas"
                                value={stats.totalProposals}
                                icon={Assignment}
                                bgColor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Propostas Pendentes"
                                value={stats.pendingProposals}
                                icon={Assignment}
                                bgColor="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Propostas Aprovadas"
                                value={stats.approvedProposals}
                                icon={Check}
                                bgColor="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Apólices Convertidas"
                                value={stats.convertedPolicies}
                                icon={Check}
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
                                    Gráfico de propostas será exibido aqui
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, borderRadius: 3, height: '400px' }}>
                                <Typography variant="h6" fontWeight="bold" mb={2}>
                                    Propostas Recentes
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Últimas propostas criadas serão exibidas aqui
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
};

export default CorretoraDashboard;
