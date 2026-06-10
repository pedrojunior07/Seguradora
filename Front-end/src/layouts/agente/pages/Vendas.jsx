import { Typography, Box, Container } from '@mui/material';
import { Card, Empty, Button } from 'antd';
import { ShoppingOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const Vendas = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Minhas Vendas
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Acompanhe o histórico das suas vendas.
          </Typography>
        </Box>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/agente/vendas/nova')}
          style={{ borderRadius: 10, background: '#1e293b', borderColor: '#1e293b', height: 40, fontWeight: 600 }}
        >
          Nova Venda
        </Button>
      </Box>

      <Card style={{ borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
        <Empty
          image={<ShoppingOutlined style={{ fontSize: 64, color: '#cbd5e1' }} />}
          description={
            <span style={{ color: '#94a3b8', fontSize: 14 }}>
              Nenhuma venda registada
            </span>
          }
        />
      </Card>
    </Container>
  );
};

export default Vendas;
