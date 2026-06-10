import { useState, useEffect } from 'react';
import { Typography, Grid, Box, Container } from '@mui/material';
import { Card, Statistic, Spin } from 'antd';
import {
  InsuranceOutlined,
  TeamOutlined,
  ShoppingOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { useAuth } from '@context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AgenteDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSeguros: 0,
    totalClientes: 0,
    totalVendas: 0,
    comissaoTotal: 0,
  });

  useEffect(() => {
    setLoading(false);
  }, []);

  const getCurrentDateFormatted = () => {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return new Date().toLocaleDateString('pt-BR', options);
  };

  const statCards = [
    { title: 'Seguros Ativos', value: stats.totalSeguros, icon: <InsuranceOutlined style={{ fontSize: 24, color: '#2563EB' }} />, color: '#2563EB', route: '/agente/seguros' },
    { title: 'Clientes', value: stats.totalClientes, icon: <TeamOutlined style={{ fontSize: 24, color: '#10B981' }} />, color: '#10B981', route: '/agente/clientes' },
    { title: 'Vendas', value: stats.totalVendas, icon: <ShoppingOutlined style={{ fontSize: 24, color: '#F59E0B' }} />, color: '#F59E0B', route: '/agente/vendas' },
    { title: 'Comissão Total', value: `${stats.comissaoTotal.toFixed(2)} MT`, icon: <RiseOutlined style={{ fontSize: 24, color: '#6366F1' }} />, color: '#6366F1', route: null },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 1, letterSpacing: '-0.02em' }}>
          Olá, {user?.name || 'Agente'}!
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
          {getCurrentDateFormatted()} • Bem-vindo de volta ao seu painel.
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <Spin size="large" />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {statCards.map((card) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.title}>
              <Card
                hoverable={!!card.route}
                onClick={() => card.route && navigate(card.route)}
                style={{ borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', cursor: card.route ? 'pointer' : 'default' }}
                styles={{ body: { padding: 24 } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Statistic
                    title={<span style={{ color: '#64748b', fontWeight: 500 }}>{card.title}</span>}
                    value={card.value}
                    valueStyle={{ color: '#1e293b', fontWeight: 700, fontSize: 28 }}
                  />
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {card.icon}
                  </div>
                </div>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default AgenteDashboard;
