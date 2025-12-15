import { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Typography, Toolbar } from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Description,
    Payment,
    Assignment,
} from '@mui/icons-material';
import Navbar from '@components/Navbar';
import Sidebar from '@components/Sidebar';
import StatCard from '@components/StatCard';
import clienteService from '@services/cliente.service';
import { drawerWidth } from '@components/Sidebar';

const menuItems = [
    { name: 'Dashboard', route: '/cliente/dashboard', icon: <DashboardIcon />, key: 'dashboard' },
    {
        name: 'Minhas Apólices',
        route: '/cliente/policies',
        icon: <Description />,
        key: 'policies',
    },
    {
        name: 'Sinistros',
        route: '/cliente/claims',
        icon: <Assignment />,
        key: 'claims',
    },
    {
        name: 'Pagamentos',
        route: '/cliente/payments',
        icon: <Payment />,
        key: 'payments',
    },
];

const ClienteDashboard = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [stats, setStats] = useState({
        activePolicies: 0,
        claims: 0,
        pendingPayments: 0,
        overduePayments: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [policies, claims, pending, overdue] = await Promise.all([
                clienteService.getActivePolicies(),
                clienteService.getClaims(),
                clienteService.getPendingPayments(),
                clienteService.getOverduePayments(),
            ]);

            setStats({
                activePolicies: policies.data?.length || 0,
                claims: claims.data?.length || 0,
                pendingPayments: pending.data?.length || 0,
                overduePayments: overdue.data?.length || 0,
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
            <Navbar title="Dashboard - Cliente" onMenuClick={handleDrawerToggle} />
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
                        Minhas Informações
                    </Typography>

                    <Grid container spacing={3} mb={4}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Apólices Ativas"
                                value={stats.activePolicies}
                                icon={Description}
                                bgColor="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Sinistros"
                                value={stats.claims}
                                icon={Assignment}
                                bgColor="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Pagamentos Pendentes"
                                value={stats.pendingPayments}
                                icon={Payment}
                                bgColor="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Pagamentos Atrasados"
                                value={stats.overduePayments}
                                icon={Payment}
                                bgColor="linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)"
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3, borderRadius: 3, height: '300px' }}>
                                <Typography variant="h6" fontWeight="bold" mb={2}>
                                    Próximos Pagamentos
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Lista de próximos pagamentos será exibida aqui
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3, borderRadius: 3, height: '300px' }}>
                                <Typography variant="h6" fontWeight="bold" mb={2}>
                                    Status de Sinistros
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Acompanhamento de sinistros será exibido aqui
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
};

export default ClienteDashboard;
