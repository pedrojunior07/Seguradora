import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Typography, Button, Alert } from 'antd';
import {
  ArrowRightOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import StatsCards from '../components/StatsCards';
import seguradoraService from '@services/seguradora.service';
import moment from 'moment';

const { Text } = Typography;

const SectionCard = ({ title, icon, iconBg, iconColor, count, countColor, onViewAll, viewAllLabel, children, loading }) => (
  <Card
    style={{
      borderRadius: 16,
      border: '1.5px solid #E2E8F0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      height: '100%',
      background: '#fff',
    }}
    styles={{ body: { padding: 0 } }}
  >
    <div style={{
      padding: '14px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #f8fafc',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          color: iconColor,
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <span style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{title}</span>
        {count > 0 && (
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#fff',
            background: countColor,
            borderRadius: 10,
            padding: '2px 8px',
            lineHeight: 1.6,
          }}>
            {count}
          </span>
        )}
      </div>
      <Button
        type="text"
        size="small"
        onClick={onViewAll}
        style={{ fontSize: 12, color: '#2563EB', padding: '0 4px', fontWeight: 500 }}
      >
        {viewAllLabel} <ArrowRightOutlined style={{ fontSize: 10 }} />
      </Button>
    </div>
    {children}
  </Card>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const [pendingPolicies, setPendingPolicies] = useState([]);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString('pt-PT', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [policies, claims, vStatus] = await Promise.all([
          seguradoraService.getPendingPolicies(),
          seguradoraService.getPendingClaims(),
          seguradoraService.getVerificacaoStatus(),
        ]);
        setPendingPolicies((policies.data || []).slice(0, 6));
        setPendingClaims((claims.data || []).slice(0, 6));
        setVerificationStatus(vStatus);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const policyColumns = [
    {
      title: 'Apólice',
      dataIndex: 'numero_apolice',
      key: 'numero',
      render: (t) => (
        <Text style={{ fontFamily: 'monospace', fontWeight: 600, color: '#2563EB', fontSize: 13 }}>
          {t || '—'}
        </Text>
      ),
    },
    {
      title: 'Seguro',
      key: 'seguro',
      ellipsis: true,
      render: (_, r) => r.seguradora_seguro?.seguro?.nome || '—',
    },
    {
      title: 'Cliente',
      key: 'cliente',
      ellipsis: true,
      render: (_, r) => r.cliente?.nome || '—',
    },
  ];

  const claimColumns = [
    {
      title: 'Sinistro',
      dataIndex: 'numero_sinistro',
      key: 'numero',
      render: (t) => (
        <Text style={{ fontFamily: 'monospace', fontWeight: 600, color: '#2563EB', fontSize: 13 }}>
          {t || '—'}
        </Text>
      ),
    },
    {
      title: 'Cliente',
      key: 'cliente',
      ellipsis: true,
      render: (_, r) => r.apolice?.cliente?.nome || r.cliente?.nome || '—',
    },
    {
      title: 'Ocorrência',
      dataIndex: 'data_ocorrencia',
      key: 'data',
      render: (d) => d ? moment(d).format('DD/MM/YYYY') : '—',
    },
  ];

  const needsVerification = verificationStatus && verificationStatus.status_verificacao !== 'aprovado';

  return (
    <div className="page-container">

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
          Painel
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4, textTransform: 'capitalize' }}>
          {today}
        </div>
      </div>

      {/* Verification banner */}
      {needsVerification && (
        <Alert
          type="warning"
          showIcon
          icon={<SafetyCertificateOutlined />}
          message={
            verificationStatus.status_verificacao === 'pendente'
              ? 'Verificação em análise'
              : 'Verificação necessária'
          }
          description={
            verificationStatus.status_verificacao === 'pendente'
              ? 'Os seus documentos estão a ser analisados. Poderá operar assim que for aprovado.'
              : 'A sua conta ainda não foi verificada. Envie os documentos para começar a operar.'
          }
          action={
            verificationStatus.status_verificacao !== 'pendente' && (
              <Button size="small" onClick={() => navigate('/seguradora/perfil/verificacao')}>
                Verificar conta
              </Button>
            )
          }
          style={{ marginBottom: 28, borderRadius: 8 }}
        />
      )}

      {/* Stats */}
      <div style={{ marginBottom: 32 }}>
        <StatsCards />
      </div>

      {/* Section label */}
      <div style={{ marginBottom: 16 }}>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          Requer ação
        </span>
      </div>

      {/* Tables */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12}>
          <SectionCard
            title="Apólices Pendentes"
            icon={<ClockCircleOutlined />}
            iconBg="#fff7ed"
            iconColor="#f59e0b"
            count={pendingPolicies.length}
            countColor="#f59e0b"
            onViewAll={() => navigate('/seguradora/apolices')}
            viewAllLabel="Ver todas"
          >
            <Table
              columns={policyColumns}
              dataSource={pendingPolicies}
              rowKey={(r) => r.id ?? r.numero_apolice}
              loading={loading}
              pagination={false}
              size="small"
              locale={{ emptyText: 'Sem apólices pendentes' }}
              style={{ borderRadius: '0 0 12px 12px', overflow: 'hidden' }}
            />
          </SectionCard>
        </Col>

        <Col xs={24} lg={12}>
          <SectionCard
            title="Sinistros Pendentes"
            icon={<ExclamationCircleOutlined />}
            iconBg="#fef2f2"
            iconColor="#ef4444"
            count={pendingClaims.length}
            countColor="#ef4444"
            onViewAll={() => navigate('/seguradora/sinistros')}
            viewAllLabel="Ver todos"
          >
            <Table
              columns={claimColumns}
              dataSource={pendingClaims}
              rowKey={(r) => r.id ?? r.numero_sinistro}
              loading={loading}
              pagination={false}
              size="small"
              locale={{ emptyText: 'Sem sinistros pendentes' }}
              style={{ borderRadius: '0 0 12px 12px', overflow: 'hidden' }}
            />
          </SectionCard>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
