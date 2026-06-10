import { Typography, Box, Container } from '@mui/material';
import { Card, Empty } from 'antd';
import { InsuranceOutlined } from '@ant-design/icons';

const MeusSeguros = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
          Meus Seguros
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
          Gerencie os seguros associados à sua conta.
        </Typography>
      </Box>

      <Card style={{ borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
        <Empty
          image={<InsuranceOutlined style={{ fontSize: 64, color: '#cbd5e1' }} />}
          description={
            <span style={{ color: '#94a3b8', fontSize: 14 }}>
              Nenhum seguro encontrado
            </span>
          }
        />
      </Card>
    </Container>
  );
};

export default MeusSeguros;
