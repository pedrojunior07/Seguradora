import React from 'react';
import { Row, Col, Card, Skeleton } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  SolutionOutlined,
  FileSearchOutlined,
  CheckCircleOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import corretoraService from '@services/corretora.service';

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
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await corretoraService.getProposals();
        const data = response.data || [];
        setStatsData({
          total: data.length,
          pending: data.filter(p => p.status === 'pendente').length,
          converted: data.filter(p => p.status === 'convertida' || p.status === 'aprovada').length,
          commission: data.reduce((sum, p) => sum + (parseFloat(p.comissao_esperada) || 0), 0),
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Propostas Ativas',
      value: statsData?.total ?? 0,
      change: null,
      icon: <SolutionOutlined />,
      color: '#2563EB',
      colorLight: '#60A5FA',
    },
    {
      title: 'Pendentes Análise',
      value: statsData?.pending ?? 0,
      change: null,
      icon: <FileSearchOutlined />,
      color: '#F59E0B',
      colorLight: '#FCD34D',
    },
    {
      title: 'Apólices Convertidas',
      value: statsData?.converted ?? 0,
      change: null,
      icon: <CheckCircleOutlined />,
      color: '#10B981',
      colorLight: '#6EE7B7',
    },
    {
      title: 'Comissão Estimada',
      value: statsData
        ? statsData.commission.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })
        : '—',
      change: null,
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
