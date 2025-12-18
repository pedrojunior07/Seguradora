// components/dashboard/RecentActivity.jsx
import { Card, Collapse, Tag, Button, Space, Badge, Timeline } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  FileAddOutlined,
  DollarOutlined,
  SyncOutlined,
  EyeOutlined,
  DownOutlined
} from '@ant-design/icons';

const { Panel } = Collapse;

const RecentActivity = () => {
  const activities = [
    {
      time: '10:30',
      date: 'Hoje',
      title: 'Sinistro Aprovado',
      description: 'Sinistro #4567 - Colisão veicular',
      details: 'Cliente: João Silva | Valor: R$ 8.500,00 | Seguro: Auto Premium',
      icon: <CheckCircleOutlined />,
      status: 'Aprovado',
      color: '#10b981',
      bgColor: '#ecfdf5',
      borderColor: '#d1fae5',
    },
    {
      time: '09:15',
      date: 'Hoje',
      title: 'Nova Apólice',
      description: 'João Santos - Seguro Residencial',
      details: 'Apólice #7891 | Valor: R$ 2.500,00/ano | Vigência: 12 meses',
      icon: <FileAddOutlined />,
      status: 'Novo',
      color: '#3b82f6',
      bgColor: '#eff6ff',
      borderColor: '#dbeafe',
    },
    {
      time: '16:45',
      date: 'Ontem',
      title: 'Pagamento Recebido',
      description: 'Apólice #7890 - R$ 1.250,00',
      details: 'Método: Transferência Bancária | Confirmado às 16:50',
      icon: <DollarOutlined />,
      status: 'Pago',
      color: '#10b981',
      bgColor: '#ecfdf5',
      borderColor: '#d1fae5',
    },
    {
      time: '14:20',
      date: 'Ontem',
      title: 'Sinistro Pendente',
      description: 'Sinistro #4568 - Requer análise técnica',
      details: 'Aguardando vistoria do perito | Prazo: 3 dias úteis',
      icon: <ClockCircleOutlined />,
      status: 'Pendente',
      color: '#f59e0b',
      bgColor: '#fffbeb',
      borderColor: '#fef3c7',
    },
    {
      time: '11:00',
      date: 'Ontem',
      title: 'Renovação Automática',
      description: '12 apólices renovadas automaticamente',
      details: 'Total renovado: R$ 45.600,00 | Próxima renovação: 30 dias',
      icon: <SyncOutlined />,
      status: 'Concluído',
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      borderColor: '#ede9fe',
    },
  ];

  const statusConfig = {
    'Aprovado': { color: '#10b981', bg: '#ecfdf5' },
    'Novo': { color: '#3b82f6', bg: '#eff6ff' },
    'Pago': { color: '#10b981', bg: '#ecfdf5' },
    'Pendente': { color: '#f59e0b', bg: '#fffbeb' },
    'Concluído': { color: '#8b5cf6', bg: '#f5f3ff' },
  };

  return (
    <Card
      style={{
        borderRadius: 12,
        border: '1px solid #f0f0f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
      }}
      bodyStyle={{ padding: 0 }}
    >
      <Collapse
        bordered={false}
        defaultActiveKey={['1']}
        expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}
        style={{ background: 'transparent' }}
      >
        <Panel
          header={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 16 }}>Atividades Recentes</span>
                <Badge
                  count={activities.length}
                  style={{
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280',
                    fontWeight: 500
                  }}
                />
              </div>
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                style={{ color: '#1e40af' }}
                onClick={(e) => e.stopPropagation()}
              >
                Ver todas
              </Button>
            </div>
          }
          key="1"
          style={{ border: 'none' }}
        >
          <div style={{ padding: '0 16px 16px 16px' }}>
            <Timeline
              items={activities.map((activity, index) => ({
                key: index,
                dot: (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: activity.bgColor,
                      border: `2px solid ${activity.color}`,
                      color: activity.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14
                    }}
                  >
                    {activity.icon}
                  </div>
                ),
                children: (
                  <div
                    style={{
                      marginLeft: 12,
                      padding: 12,
                      borderRadius: 8,
                      border: `1px solid ${activity.borderColor}`,
                      backgroundColor: '#fff',
                      marginBottom: index < activities.length - 1 ? 8 : 0
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{activity.title}</span>
                          <Tag
                            style={{
                              color: statusConfig[activity.status].color,
                              backgroundColor: statusConfig[activity.status].bg,
                              borderColor: statusConfig[activity.status].color,
                              margin: 0,
                              fontSize: 11,
                              fontWeight: 500,
                              padding: '0 6px',
                              borderRadius: 10,
                            }}
                          >
                            {activity.status}
                          </Tag>
                        </div>
                        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>
                          {activity.description}
                        </div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>
                          {activity.details}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>
                          {activity.date}
                        </div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              }))}
            />

            {/* Resumo das atividades */}
            <div style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <Space size={16}>
                <Space size={6}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>Aprovados: 2</span>
                </Space>
                <Space size={6}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>Pendentes: 1</span>
                </Space>
                <Space size={6}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#3b82f6' }}></div>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>Novos: 1</span>
                </Space>
              </Space>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>
                Últimas 24 horas
              </span>
            </div>
          </div>
        </Panel>
      </Collapse>
    </Card>
  );
};

export default RecentActivity;