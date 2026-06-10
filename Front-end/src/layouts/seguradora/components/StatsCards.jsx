import React from 'react';
import { Row, Col, Card, Skeleton } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  InsuranceOutlined,
  FileDoneOutlined,
  AlertOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import api from '@services/api';

const StatCard = ({ title, value, change, icon, color, colorLight, loading }) => (
  <Card
    style={{
      borderRadius: 20,
      border: `1.5px solid ${color}40`,
      boxShadow: `0 6px 28px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)`,
      height: '100%',
      background: `linear-gradient(145deg, #ffffff 40%, ${color}13 100%)`,
      overflow: 'hidden',
    }}
    styles={{ body: { padding: '26px 24px' } }}
  >
    {loading ? (
      <Skeleton active paragraph={{ rows: 2 }} title={false} />
    ) : (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
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
            flexShrink: 0,
          }}>
            {icon}
          </div>

          {change !== null && (
            <span style={{
              fontSize: 12,
              fontWeight: 600,
              color: change >= 0 ? '#059669' : '#dc2626',
              background: change >= 0 ? '#ecfdf5' : '#fef2f2',
              padding: '4px 10px',
              borderRadius: 20,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
            }}>
              {change >= 0
                ? <ArrowUpOutlined style={{ fontSize: 10 }} />
                : <ArrowDownOutlined style={{ fontSize: 10 }} />}
              {Math.abs(change)}%
            </span>
          )}
        </div>

        <div style={{ fontSize: 34, fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: 8, letterSpacing: '-0.5px' }}>
          {value}
        </div>
        <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
          {title}
        </div>
      </>
    )}
  </Card>
);

const StatsCards = () => {
  const [statsData, setStatsData] = React.useState(null);
  const [loading, setStatsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/seguradora/dashboard/resumo');
        setStatsData(response.data);
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Apólices Ativas',
      value: statsData?.apolices_ativas?.value ?? 0,
      change: statsData?.apolices_ativas?.change ?? null,
      icon: <InsuranceOutlined />,
      color: '#2563EB',
      colorLight: '#60A5FA',
    },
    {
      title: 'Sinistros Pendentes',
      value: statsData?.sinistros_pendentes?.value ?? 0,
      change: statsData?.sinistros_pendentes?.change ?? null,
      icon: <AlertOutlined />,
      color: '#EF4444',
      colorLight: '#FCA5A5',
    },
    {
      title: 'Novos Contratos',
      value: statsData?.novos_contratos?.value ?? 0,
      change: statsData?.novos_contratos?.change ?? null,
      icon: <FileDoneOutlined />,
      color: '#10B981',
      colorLight: '#6EE7B7',
    },
    {
      title: 'Prémio Mensal',
      value: statsData?.premio_mensal?.formatted ?? '—',
      change: statsData?.premio_mensal?.change ?? null,
      icon: <DollarOutlined />,
      color: '#7C3AED',
      colorLight: '#C4B5FD',
    },
  ];

  return (
    <Row gutter={[20, 20]}>
      {cards.map((card, index) => (
        <Col xs={24} sm={12} xl={6} key={index}>
          <StatCard {...card} loading={loading} />
        </Col>
      ))}
    </Row>
  );
};

export default StatsCards;
