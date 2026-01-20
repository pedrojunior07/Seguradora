// components/dashboard/StatsCards.jsx
import React from 'react';
import { Card, Row, Col, Progress } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  InsuranceOutlined,
  FileDoneOutlined,
  AlertOutlined,
  DollarOutlined
} from '@ant-design/icons';

const StatsCards = () => {
  const [statsData, setStatsData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Importar dinamicamente ou usar axios diretamente se o serviço não estiver pronto
    // Assumindo uso de axios configurado ou serviço
    const fetchStats = async () => {
      try {
        // Obter token do localStorage ou contexto (geralmente api.js já trata)
        // Substituir URL pela rota correta
        const response = await fetch('http://localhost:8000/api/seguradora/dashboard/resumo', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          }
        });
        const data = await response.json();
        setStatsData(data);
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getStats = () => [
    {
      title: 'Apólices Ativas',
      value: statsData?.apolices_ativas?.value || 0,
      change: statsData?.apolices_ativas?.change || 0,
      icon: <InsuranceOutlined />,
      color: '#1e40af',
      gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
      bgColor: '#eff6ff',
      progress: 85,
    },
    {
      title: 'Sinistros Pendentes',
      value: statsData?.sinistros_pendentes?.value || 0,
      change: statsData?.sinistros_pendentes?.change || 0,
      icon: <AlertOutlined />,
      color: '#dc2626',
      gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
      bgColor: '#fef2f2',
      progress: 28,
    },
    {
      title: 'Novos Contratos',
      value: statsData?.novos_contratos?.value || 0,
      change: statsData?.novos_contratos?.change || 0,
      icon: <FileDoneOutlined />,
      color: '#059669',
      gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      bgColor: '#f0fdf4',
      progress: 92,
    },
    {
      title: 'Prêmio Mensal',
      value: statsData?.premio_mensal?.formatted || 'MZN 0.00',
      change: statsData?.premio_mensal?.change || 0,
      icon: <DollarOutlined />,
      color: '#0891b2',
      gradient: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
      bgColor: '#f0fdfa',
      progress: 68,
    },
  ];

  const stats = getStats();

  return (
    <Row gutter={[16, 16]}>
      {stats.map((stat, index) => (
        <Col xs={24} sm={12} lg={6} key={index}>
          <Card
            loading={loading}
            style={{
              height: '100%',
              borderRadius: 16,
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            bodyStyle={{ padding: '20px' }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              }
            }}
          >
            {/* Top bar colorida */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: stat.gradient,
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Header com ícone */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginBottom: 8 }}>
                    {stat.title}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937', lineHeight: 1 }}>
                    {stat.value}
                  </div>
                </div>

                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    background: stat.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    color: '#fff',
                    boxShadow: `0 4px 12px ${stat.color}40`,
                  }}
                >
                  {stat.icon}
                </div>
              </div>

              {/* Progress bar */}
              <Progress
                percent={stat.progress}
                strokeColor={stat.gradient}
                trailColor="#f3f4f6"
                showInfo={false}
                strokeWidth={6}
                style={{ margin: '4px 0' }}
              />

              {/* Footer com mudança */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 13,
                    fontWeight: 600,
                    color: stat.change >= 0 ? '#059669' : '#dc2626',
                    padding: '4px 8px',
                    borderRadius: 6,
                    background: stat.change >= 0 ? '#f0fdf4' : '#fef2f2',
                  }}
                >
                  {stat.change >= 0 ? (
                    <ArrowUpOutlined style={{ fontSize: 12 }} />
                  ) : (
                    <ArrowDownOutlined style={{ fontSize: 12 }} />
                  )}
                  <span>{Math.abs(stat.change)}%</span>
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>
                  vs mês anterior
                </div>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StatsCards;