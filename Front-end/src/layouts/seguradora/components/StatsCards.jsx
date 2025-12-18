// components/dashboard/StatsCards.jsx
import React from 'react';
import { Card, Row, Col } from 'antd';
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
      icon: <InsuranceOutlined style={{ color: '#1e40af' }} />,
      color: '#1e40af',
      bgColor: '#dbeafe',
    },
    {
      title: 'Sinistros Pendentes',
      value: 43,
      change: -5,
      icon: <AlertOutlined style={{ color: '#dc2626' }} />,
      color: '#dc2626',
      bgColor: '#fee2e2',
    },
    {
      title: 'Novos Contratos',
      value: 89,
      change: 24,
      icon: <FileDoneOutlined style={{ color: '#059669' }} />,
      color: '#059669',
      bgColor: '#d1fae5',
    },
    {
      title: 'Prêmio Mensal',
      value: 'R$ 2.4M',
      change: 8,
      icon: <DollarOutlined style={{ color: '#0891b2' }} />,
      color: '#0891b2',
      bgColor: '#cffafe',
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {stats.map((stat, index) => (
        <Col xs={24} sm={12} lg={6} key={index}>
          <Card className="h-full hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-gray-500 text-sm mb-2 font-medium">{stat.title}</div>
                <div className="text-2xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
                <div className={`flex items-center text-sm ${
                  stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change >= 0 ? (
                    <ArrowUpOutlined className="mr-1" />
                  ) : (
                    <ArrowDownOutlined className="mr-1" />
                  )}
                  {Math.abs(stat.change)}% vs mês anterior
                </div>
              </div>
              <div
                className="text-3xl p-3 rounded-lg"
                style={{
                  backgroundColor: stat.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {stat.icon}
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StatsCards;