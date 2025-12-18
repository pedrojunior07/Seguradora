// components/dashboard/ClaimsOverview.jsx
import { Card, Collapse, Select, Table, Row, Col, Tag, Button, Badge } from 'antd';
import {
  LineChartOutlined,
  FilterOutlined,
  DownloadOutlined,
  EyeOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DownOutlined
} from '@ant-design/icons';
import SimpleChart from './SimpleChart';

const { Option } = Select;
const { Panel } = Collapse;

const ClaimsOverview = () => {
  const columns = [
    {
      title: 'Tipo de Sinistro',
      dataIndex: 'type',
      key: 'type',
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <WarningOutlined style={{ color: '#f59e0b' }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </div>
      ),
    },
    {
      title: 'Quantidade',
      dataIndex: 'count',
      key: 'count',
      render: (count) => (
        <span style={{ fontWeight: 600, color: '#374151' }}>{count}</span>
      ),
    },
    {
      title: 'Valor Médio',
      dataIndex: 'average',
      key: 'average',
      render: (average) => (
        <span style={{ fontWeight: 500, color: '#6b7280' }}>{average}</span>
      ),
    },
    {
      title: 'Valor Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => (
        <span style={{ fontWeight: 600, color: '#1e40af' }}>{total}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          'Pendente': { color: '#f59e0b', bg: '#fffbeb', icon: <ClockCircleOutlined /> },
          'Aprovado': { color: '#10b981', bg: '#ecfdf5', icon: <CheckCircleOutlined /> },
          'Rejeitado': { color: '#ef4444', bg: '#fef2f2', icon: <CloseCircleOutlined /> },
          'Em Análise': { color: '#3b82f6', bg: '#eff6ff', icon: <WarningOutlined /> },
        };

        const config = statusConfig[status] || statusConfig['Pendente'];

        return (
          <Tag
            style={{
              color: config.color,
              backgroundColor: config.bg,
              borderColor: config.color,
              margin: 0,
              fontSize: 11,
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: 12,
            }}
          >
            {config.icon}
            <span style={{ marginLeft: 4 }}>{status}</span>
          </Tag>
        );
      },
    },
  ];

  const data = [
    {
      key: '1',
      type: 'Colisão Veicular',
      count: 12,
      average: 'R$ 15.000',
      total: 'R$ 180.000',
      status: 'Pendente',
    },
    {
      key: '2',
      type: 'Roubo/Furto',
      count: 5,
      average: 'R$ 45.000',
      total: 'R$ 225.000',
      status: 'Aprovado',
    },
    {
      key: '3',
      type: 'Incêndio Residencial',
      count: 3,
      average: 'R$ 120.000',
      total: 'R$ 360.000',
      status: 'Pendente',
    },
    {
      key: '4',
      type: 'Danos Elétricos',
      count: 8,
      average: 'R$ 8.500',
      total: 'R$ 68.000',
      status: 'Rejeitado',
    },
    {
      key: '5',
      type: 'Acidentes Pessoais',
      count: 7,
      average: 'R$ 22.000',
      total: 'R$ 154.000',
      status: 'Em Análise',
    },
  ];

  const stats = [
    {
      title: 'Total Sinistros',
      value: 35,
      change: -12,
      color: '#3b82f6',
      icon: <WarningOutlined />,
    },
    {
      title: 'Pendentes',
      value: 15,
      change: 5,
      color: '#f59e0b',
      icon: <ClockCircleOutlined />,
    },
    {
      title: 'Aprovados',
      value: 12,
      change: 8,
      color: '#10b981',
      icon: <CheckCircleOutlined />,
    },
    {
      title: 'Valor Total',
      value: 'R$ 987K',
      change: -15,
      color: '#8b5cf6',
      icon: <LineChartOutlined />,
    },
  ];

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
                <div style={{ padding: 8, background: '#eff6ff', borderRadius: 8 }}>
                  <LineChartOutlined style={{ color: '#1e40af', fontSize: 18 }} />
                </div>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 16 }}>Visão Geral de Sinistros</span>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Análise detalhada de sinistros</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                <Button
                  icon={<FilterOutlined />}
                  size="small"
                  style={{ color: '#6b7280' }}
                >
                  Filtrar
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  size="small"
                  style={{ color: '#1e40af' }}
                >
                  Exportar
                </Button>
              </div>
            </div>
          }
          key="1"
          style={{ border: 'none' }}
        >
          <div style={{ padding: '0 16px 16px 16px' }}>
            {/* Estatísticas rápidas */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {stats.map((stat, index) => (
                <Col xs={12} sm={6} key={index}>
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      border: `1px solid ${stat.color}20`,
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{stat.title}</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#374151' }}>{stat.value}</div>
                        <div style={{
                          fontSize: 11,
                          fontWeight: 500,
                          marginTop: 4,
                          color: stat.change >= 0 ? '#10b981' : '#ef4444'
                        }}>
                          {stat.change >= 0 ? '+' : ''}{stat.change}% vs mês anterior
                        </div>
                      </div>
                      <div
                        style={{
                          padding: 8,
                          borderRadius: 8,
                          backgroundColor: `${stat.color}20`,
                          color: stat.color,
                          fontSize: 18
                        }}
                      >
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>

            {/* Gráfico e filtros */}
            <div style={{
              marginBottom: 24,
              padding: 16,
              background: 'linear-gradient(to right, #f9fafb, #eff6ff)',
              borderRadius: 8,
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h4 style={{ fontWeight: 500, color: '#374151', margin: 0 }}>Evolução Mensal</h4>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Últimos 12 meses</p>
                </div>
                <Select
                  defaultValue="month"
                  size="small"
                  style={{ width: 140 }}
                  suffixIcon={<FilterOutlined style={{ color: '#9ca3af' }} />}
                >
                  <Option value="week">Esta Semana</Option>
                  <Option value="month">Este Mês</Option>
                  <Option value="quarter">Este Trimestre</Option>
                  <Option value="year">Este Ano</Option>
                </Select>
              </div>
              <SimpleChart />

              {/* Legenda do gráfico */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 12, height: 12, backgroundColor: '#3b82f6', borderRadius: '50%' }}></div>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Sinistros</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 12, height: 12, backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Valor Médio</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 12, height: 12, backgroundColor: '#10b981', borderRadius: '50%' }}></div>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Resolvidos</span>
                </div>
              </div>
            </div>

            {/* Tabela de sinistros */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h4 style={{ fontWeight: 500, color: '#374151', margin: 0 }}>Tipos de Sinistro</h4>
                <Button
                  type="text"
                  size="small"
                  icon={<EyeOutlined />}
                  style={{ color: '#1e40af' }}
                >
                  Ver detalhes
                </Button>
              </div>

              <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                size="small"
              />
            </div>

            {/* Rodapé com insights */}
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div style={{ padding: 12, backgroundColor: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <WarningOutlined style={{ color: '#f59e0b' }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Pendentes Críticos</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    3 sinistros aguardando há mais de 30 dias
                  </div>
                </div>

                <div style={{ padding: 12, backgroundColor: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <ClockCircleOutlined style={{ color: '#3b82f6' }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Tempo Médio</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    12.5 dias para resolução de sinistros
                  </div>
                </div>

                <div style={{ padding: 12, backgroundColor: '#ecfdf5', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <CheckCircleOutlined style={{ color: '#10b981' }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Satisfação</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    92% de satisfação dos clientes
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </Collapse>
    </Card>
  );
};

export default ClaimsOverview;