import { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Tag, Typography, Skeleton, message } from 'antd';
import { TeamOutlined, BankOutlined, FileProtectOutlined, AlertOutlined } from '@ant-design/icons';
import AdminService from '../../../services/admin.service';

const { Title, Text } = Typography;

const StatCard = ({ title, value, icon, color, colorLight, loading }) => (
  <Card
    style={{
      borderRadius: 20,
      border: `1.5px solid ${color}40`,
      boxShadow: '0 6px 28px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)',
      background: `linear-gradient(145deg, #ffffff 40%, ${color}13 100%)`,
      overflow: 'hidden',
    }}
    styles={{ body: { padding: '26px 24px' } }}
  >
    {loading ? (
      <Skeleton active paragraph={{ rows: 2 }} title={false} />
    ) : (
      <>
        <div style={{ marginBottom: 22 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${color} 0%, ${colorLight} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            color: '#fff',
            boxShadow: `0 6px 16px ${color}40`,
          }}>
            {icon}
          </div>
        </div>
        <div style={{ fontSize: 34, fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: 8, letterSpacing: '-0.5px' }}>
          {value ?? '—'}
        </div>
        <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{title}</div>
      </>
    )}
  </Card>
);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminService.getDashboardStats()
      .then(setStats)
      .catch(() => message.error('Erro ao carregar estatísticas'))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { title: 'Utilizadores', value: stats?.stats?.total_usuarios, icon: <TeamOutlined />, color: '#2563EB', colorLight: '#60A5FA' },
    { title: 'Seguradoras', value: stats?.stats?.total_seguradoras, icon: <BankOutlined />, color: '#10B981', colorLight: '#6EE7B7' },
    { title: 'Apólices', value: stats?.stats?.total_apolices, icon: <FileProtectOutlined />, color: '#7C3AED', colorLight: '#C4B5FD' },
    { title: 'Sinistros', value: stats?.stats?.total_sinistros, icon: <AlertOutlined />, color: '#EF4444', colorLight: '#FCA5A5' },
  ];

  const userColumns = [
    { title: 'Nome', dataIndex: 'name', key: 'name', render: (v) => <Text strong>{v}</Text> },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (v) => <Text type="secondary">{v}</Text> },
    {
      title: 'Perfil',
      dataIndex: 'perfil',
      key: 'perfil',
      render: (role) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: 'Data',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => <Text type="secondary">{new Date(date).toLocaleDateString('pt-PT')}</Text>,
    },
  ];

  return (
    <div className="page-container">
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
          Visão Geral
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
          Painel de administração do sistema
        </div>
      </div>

      <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
        {cards.map((card, i) => (
          <Col xs={24} sm={12} xl={6} key={i}>
            <StatCard {...card} loading={loading} />
          </Col>
        ))}
      </Row>

      <Card
        style={{ borderRadius: 16, border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f8fafc' }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>Últimos Utilizadores Registados</span>
        </div>
        <Table
          dataSource={stats?.recent_users}
          columns={userColumns}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default DashboardPage;
