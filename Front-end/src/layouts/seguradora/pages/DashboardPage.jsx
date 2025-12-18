import { useAuth } from '@context/AuthContext';
import { Row, Col, Typography, Card, Space, Divider } from 'antd';
import {
  DashboardOutlined,
  CalendarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import StatsCards from '../components/StatsCards';
import ClaimsOverview from '../components/ClaimsOverview';
import RecentActivity from '../components/RecentActivity';

const { Title, Text } = Typography;

const DashboardPage = () => {
  const { user, entidade } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-PT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ padding: isMobile ? '12px' : '24px', background: '#f5f7fa', minHeight: '100vh' }}>
      {/* Welcome Section */}
      <Card
        style={{
          marginBottom: isMobile ? 16 : 24,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          border: 'none',
          boxShadow: '0 4px 12px rgba(30, 64, 175, 0.15)'
        }}
        bodyStyle={{ padding: isMobile ? '20px' : '32px' }}
      >
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <Title level={isMobile ? 3 : 2} style={{ margin: 0, color: '#fff', fontWeight: 600 }}>
                <DashboardOutlined style={{ marginRight: 12 }} />
                Olá, {entidade?.nome || user?.name || 'Seguradora'}!
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: isMobile ? 13 : 15, marginTop: 8, display: 'block' }}>
                Bem-vindo ao seu painel de controle
              </Text>
            </div>
            {!isMobile && (
              <Space direction="vertical" size={4} style={{ textAlign: 'right' }}>
                <Space style={{ color: '#fff', fontSize: 14 }}>
                  <CalendarOutlined />
                  <span style={{ textTransform: 'capitalize' }}>{formatDate(currentTime)}</span>
                </Space>
                <Space style={{ color: '#fff', fontSize: 14 }}>
                  <ClockCircleOutlined />
                  <span>{formatTime(currentTime)}</span>
                </Space>
              </Space>
            )}
          </div>
          {isMobile && (
            <Space style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, marginTop: 8 }}>
              <CalendarOutlined />
              <span>{new Date().toLocaleDateString('pt-PT')}</span>
              <ClockCircleOutlined />
              <span>{formatTime(currentTime)}</span>
            </Space>
          )}
        </Space>
      </Card>

      {/* Stats Cards */}
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <StatsCards />
      </div>

      {/* Main Content Grid */}
      <Row gutter={[24, 24]}>
        {/* Main Content - Full Width */}
        <Col xs={24}>
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            <ClaimsOverview />
            <RecentActivity />
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
