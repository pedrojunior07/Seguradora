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
  const stats = [
    {
      title: 'Apólices Ativas',
      value: 1248,
      change: 12,
      icon: <InsuranceOutlined />,
      color: '#1e40af',
      gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
      bgColor: '#eff6ff',
      progress: 85,
    },
    {
      title: 'Sinistros Pendentes',
      value: 43,
      change: -5,
      icon: <AlertOutlined />,
      color: '#dc2626',
      gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
      bgColor: '#fef2f2',
      progress: 28,
    },
    {
      title: 'Novos Contratos',
      value: 89,
      change: 24,
      icon: <FileDoneOutlined />,
      color: '#059669',
      gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      bgColor: '#f0fdf4',
      progress: 92,
    },
    {
      title: 'Prêmio Mensal',
      value: 'R$ 2.4M',
      change: 8,
      icon: <DollarOutlined />,
      color: '#0891b2',
      gradient: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
      bgColor: '#f0fdfa',
      progress: 68,
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {stats.map((stat, index) => (
        <Col xs={12} sm={12} lg={6} key={index}>
          <Card
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
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
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