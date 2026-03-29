// src/layouts/corretora/components/StatsCards.jsx
import React from 'react';
import { Card, Row, Col, Progress, Typography } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  SolutionOutlined,
  FileSearchOutlined,
  CheckCircleOutlined,
  DollarOutlined
} from '@ant-design/icons';
import corretoraService from '@services/corretora.service';

const { Text, Title } = Typography;

const StatsCards = () => {
  const [statsData, setStatsData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await corretoraService.getProposals();
        const data = response.data || [];
        
        const stats = {
            total: data.length,
            pending: data.filter(p => p.status === 'pendente').length,
            converted: data.filter(p => p.status === 'convertida' || p.status === 'aprovada').length,
            commission: data.reduce((sum, p) => sum + (p.comissao_esperada || 0), 0)
        };
        
        setStatsData(stats);
      } catch (error) {
        console.error("Erro ao buscar estatísticas da corretora:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getStats = () => [
    {
      title: 'Propostas Ativas',
      value: statsData?.total || 0,
      change: 12,
      trend: 'up',
      icon: <SolutionOutlined />,
      color: '#2563EB',
      bgGradiant: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(29, 78, 216, 0.05) 100%)',
      iconBg: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
      progress: 75,
    },
    {
      title: 'Pendentes Análise',
      value: statsData?.pending || 0,
      change: 5,
      trend: 'down',
      icon: <FileSearchOutlined />,
      color: '#F59E0B',
      bgGradiant: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
      iconBg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      progress: 40,
    },
    {
      title: 'Apólices Convertidas',
      value: statsData?.converted || 0,
      change: 18,
      trend: 'up',
      icon: <CheckCircleOutlined />,
      color: '#10B981',
      bgGradiant: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
      iconBg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      progress: 62,
    },
    {
      title: 'Comissão Estimada',
      value: (statsData?.commission || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'MZN' }),
      change: 8,
      trend: 'up',
      icon: <DollarOutlined />,
      color: '#6366F1',
      bgGradiant: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.05) 100%)',
      iconBg: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
      progress: 55,
    },
  ];

  const stats = getStats();

  return (
    <Row gutter={[24, 24]}>
      {stats.map((stat, index) => (
        <Col xs={24} sm={12} lg={6} key={index}>
          <Card
            loading={loading}
            bordered={false}
            style={{
              height: '100%',
              borderRadius: '24px',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            bodyStyle={{ padding: '28px' }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = `0 16px 40px ${stat.bgGradiant.split(',')[1].replace(')', ', 0.3)')}`; // Dynamically generate shadow based on color
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.04)';
              }
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box style={{ flex: 1 }}>
                <Text
                  style={{
                    color: '#64748b',
                    fontWeight: 700,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    display: 'block',
                    marginBottom: '10px'
                  }}
                >
                  {stat.title}
                </Text>
                <Title
                  level={3}
                  style={{
                    margin: 0,
                    fontWeight: 800,
                    color: '#0f172a',
                    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {stat.value}
                </Title>

                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      color: stat.trend === 'up' ? '#059669' : '#e11d48',
                      fontWeight: 700,
                      background: stat.trend === 'up' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))' : 'linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(244, 63, 94, 0.05))',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      border: stat.trend === 'up' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(244, 63, 94, 0.2)'
                    }}
                  >
                    {stat.trend === 'up' ? <ArrowUpOutlined style={{ marginRight: 4, strokeWidth: 20 }} /> : <ArrowDownOutlined style={{ marginRight: 4, strokeWidth: 20 }} />}
                    {stat.change}%
                  </span>
                  <Text style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 500 }}>vs mês anterior</Text>
                </div>
              </Box>

              <div
                style={{
                  background: stat.iconBg,
                  padding: '14px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '24px',
                  boxShadow: `0 8px 16px -4px ${stat.bgGradiant.split(',')[1].replace(')', ', 0.4)')}`
                }}
              >
                {stat.icon}
              </div>
            </Box>

            <Progress
              percent={stat.progress}
              strokeColor={{
                '0%': stat.color,
                '100%': stat.color.replace('B', 'F').replace('1', '3'), // Dummy slight variation
              }}
              trailColor="rgba(0,0,0,0.04)"
              showInfo={false}
              strokeWidth={6}
              style={{ padding: 0, marginTop: '28px', marginBottom: 0 }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

// Simple Box helper for layout
const Box = ({ children, display, justifyContent, alignItems, style }) => (
  <div style={{ display, justifyContent, alignItems, ...style }}>{children}</div>
);

export default StatsCards;
