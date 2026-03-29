// src/layouts/corretora/components/RecentActivity.jsx
import React from 'react';
import { Timeline, Typography, Empty, Spin } from 'antd';
import { 
  FileTextOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/pt';
import corretoraService from '@services/corretora.service';

const { Text } = Typography;

const RecentActivity = () => {
  const [activities, setActivities] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchRecentProposals();
  }, []);

  const fetchRecentProposals = async () => {
    try {
      const response = await corretoraService.getProposals();
      const proposals = response.data || [];
      
      // Transform proposals into activity events for the timeline
      const events = proposals.map(p => ({
        id: p.id,
        title: `Proposta #${p.codigo || 'N/A'}`,
        description: `Status alterado para ${p.status.toUpperCase()}`,
        time: p.updated_at || p.created_at,
        type: p.status === 'convertida' ? 'success' : p.status === 'rejeitada' ? 'error' : p.status === 'aprovada' ? 'info' : 'warning',
        icon: (() => {
           if (p.status === 'convertida') return <CheckCircleOutlined style={{ fontSize: '16px' }} />;
           if (p.status === 'rejeitada') return <CloseCircleOutlined style={{ fontSize: '16px' }} />;
           return <FileTextOutlined style={{ fontSize: '14px' }} />;
        })()
      })).slice(0, 6); // Display latest 6 to keep it clean

      setActivities(events);
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimelineColors = (type) => {
    switch (type) {
      case 'success': return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'error': return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
      case 'info': return { color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.15)' };
      case 'warning': return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
      default: return { color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' };
    }
  };

  return (
    <div style={{ background: 'transparent', paddingRight: '12px' }}>
      <style>
          {`
             .premium-timeline .ant-timeline-item-tail {
                 border-inset-inline-start: 2px solid #f1f5f9 !important;
             }
             .premium-timeline .ant-timeline-item-content {
                 margin-left: 28px !important;
             }
          `}
      </style>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
        </div>
      ) : activities.length === 0 ? (
        <div style={{ padding: '40px 0' }}>
            <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<span style={{ color: '#94a3b8', fontWeight: 500 }}>Nenhuma atividade registrada</span>} 
            />
        </div>
      ) : (
        <Timeline
          className="premium-timeline"
          mode="left"
          items={activities.map(activity => {
            const theme = getTimelineColors(activity.type);
            return {
                label: (
                   <Text style={{ 
                       color: '#94a3b8', 
                       fontSize: '11px', 
                       fontWeight: 600, 
                       marginRight: '8px',
                       display: 'block' 
                   }}>
                       {moment(activity.time).format('DD MMM')}
                       <br />
                       <span style={{ fontSize: '10px', color: '#cbd5e1' }}>{moment(activity.time).format('HH:mm')}</span>
                   </Text>
                ),
                dot: (
                    <div style={{
                        background: theme.bg,
                        color: theme.color,
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 0 0 4px #ffffff, 0 4px 12px ${theme.color}40`,
                        border: `1px solid ${theme.color}30`,
                        zIndex: 2,
                        position: 'relative'
                    }}>
                       {activity.icon}
                    </div>
                ),
                children: (
                  <div style={{ 
                      marginBottom: '28px',
                      background: '#f8fafc',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #f1f5f9',
                      transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                  onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#f1f5f9';
                  }}>
                    <Text style={{ 
                        fontSize: '14px', 
                        display: 'block', 
                        fontWeight: 700, 
                        color: '#1e293b',
                        marginBottom: '4px'
                    }}>
                        {activity.title}
                    </Text>
                    <Text style={{ 
                        fontSize: '13px', 
                        color: '#64748b',
                        fontWeight: 500
                    }}>
                        {activity.description}
                    </Text>
                  </div>
                ),
            };
          })}
        />
      )}
    </div>
  );
};

export default RecentActivity;
