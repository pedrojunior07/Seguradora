import { Typography, Box, Container } from '@mui/material';
import { Card, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const NovaVenda = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/agente/vendas')}
          style={{ padding: 0, fontWeight: 600, color: '#64748b', marginBottom: 16 }}
        >
          Voltar às Vendas
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
          Nova Venda
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
          Registe uma nova venda de seguro.
        </Typography>
      </Box>

      <Card style={{ borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: 8 }}>
        <Typography variant="body1" sx={{ color: '#94a3b8', textAlign: 'center', py: 4 }}>
          Formulário de nova venda em desenvolvimento.
        </Typography>
      </Card>
    </Container>
  );
};

export default NovaVenda;
