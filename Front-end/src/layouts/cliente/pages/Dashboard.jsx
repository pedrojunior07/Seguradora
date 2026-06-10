import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Tag, Typography, Skeleton, message } from 'antd';
import {
  FileProtectOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CarOutlined,
} from '@ant-design/icons';
import ClienteLayout from '../Components/layouts/ClienteLayout';
import clienteService from '../../../services/cliente.service';
import api from '../../../services/api';

const { Text } = Typography;

const StatCard = ({ title, value, suffix, icon, color, colorLight, loading }) => (
  <Card
    style={{
      borderRadius: 20,
      border: `1.5px solid ${color}40`,
      boxShadow: '0 6px 28px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)',
      background: `linear-gradient(145deg, #ffffff 40%, ${color}13 100%)`,
      overflow: 'hidden',
    }}
    styles={{ body: { padding: '26px 24px' } }}
  >
    {loading ? (
      <Skeleton active paragraph={{ rows: 2 }} title={false} />
    ) : (
      <>
        <div style={{ marginBottom: 22 }}>
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
          }}>
            {icon}
          </div>
        </div>
        <div style={{ fontSize: 34, fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: 8, letterSpacing: '-0.5px' }}>
          {value ?? 0}{suffix ? <span style={{ fontSize: 16, fontWeight: 600, marginLeft: 4 }}>{suffix}</span> : null}
        </div>
        <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{title}</div>
      </>
    )}
  </Card>
);

const DashboardCliente = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_apolices: 0, ativas: 0, valor_total_premios: 0, bens_segurados: 0 });
  const [recentPolicies, setRecentPolicies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, policiesRes, veiculosRes, propsRes] = await Promise.all([
          api.get('/cliente/apolices/estatisticas'),
          clienteService.getActivePolicies(),
          clienteService.getMeusVeiculos(),
          clienteService.getMinhasPropriedades(),
        ]);
        setStats({
          ...statsRes.data,
          bens_segurados: (veiculosRes.data?.length || 0) + (propsRes.data?.length || 0),
        });
        setRecentPolicies(policiesRes.data || policiesRes || []);
      } catch {
        message.error('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cards = [
    { title: 'Seguros Ativos', value: stats.ativas, icon: <FileProtectOutlined />, color: '#10B981', colorLight: '#6EE7B7' },
    { title: 'Prémio Total (Anual)', value: parseFloat(stats.valor_total_premios || 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2 }), suffix: 'MT', icon: <DollarOutlined />, color: '#2563EB', colorLight: '#60A5FA' },
    { title: 'Sinistros Pendentes', value: 0, icon: <ClockCircleOutlined />, color: '#EF4444', colorLight: '#FCA5A5' },
    { title: 'Meus Bens', value: stats.bens_segurados, icon: <CarOutlined />, color: '#7C3AED', colorLight: '#C4B5FD' },
  ];

  const columns = [
    {
      title: 'Nº Apólice',
      dataIndex: 'numero_apolice',
      key: 'numero',
      render: (v) => <Text strong style={{ fontFamily: 'monospace', color: '#2563EB' }}>{v || 'PENDENTE'}</Text>,
    },
    {
      title: 'Seguro',
      key: 'seguro',
      render: (_, r) => r.seguradora_seguro?.seguro?.nome || '—',
    },
    {
      title: 'Bem',
      key: 'bem',
      render: (_, r) => r.bem_segurado?.marca
        ? `${r.bem_segurado.marca} ${r.bem_segurado.modelo}`
        : r.bem_segurado?.descricao || '—',
    },
    {
      title: 'Prémio',
      dataIndex: 'premio_total',
      key: 'premio',
      render: (v) => `${parseFloat(v || 0).toLocaleString()} MT`,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (s) => (
        <Tag color={s === 'ativa' ? 'green' : 'orange'}>
          {s?.toUpperCase().replace('_', ' ')}
        </Tag>
      ),
    },
  ];

  return (
    <ClienteLayout>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
          O seu painel de seguros
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
          Resumo das suas proteções ativas
        </div>
      </div>

      <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
        {cards.map((card, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <StatCard {...card} loading={loading} />
          </Col>
        ))}
      </Row>

      <Card
        style={{ borderRadius: 16, border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f8fafc' }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>Apólices Recentes</span>
        </div>
        <Table
          columns={columns}
          dataSource={recentPolicies.slice(0, 5)}
          pagination={false}
          rowKey="id_apolice"
          loading={loading}
          size="small"
          locale={{ emptyText: 'Nenhuma apólice encontrada' }}
        />
      </Card>
    </ClienteLayout>
  );
};

export default DashboardCliente;
