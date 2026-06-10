import { useState, useEffect } from 'react';
import { Card, Button, Alert } from 'antd';
import {
  ArrowRightOutlined,
  SafetyCertificateOutlined,
  SolutionOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import StatsCards from '../components/StatsCards';
import ProposalsOverview from '../components/ProposalsOverview';
import corretoraService from '@services/corretora.service';

const SectionCard = ({ title, icon, iconBg, iconColor, onViewAll, viewAllLabel, children }) => (
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
  const [verificationStatus, setVerificationStatus] = useState(null);

  const today = new Date().toLocaleDateString('pt-PT', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  useEffect(() => {
    corretoraService.getVerificacaoStatus()
      .then(setVerificationStatus)
      .catch(() => {});
  }, []);

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
              <Button size="small" onClick={() => navigate('/corretora/perfil/verificacao')}>
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
          Actividade recente
        </span>
      </div>

      {/* Proposals table */}
      <SectionCard
        title="Últimas Propostas"
        icon={<SolutionOutlined />}
        iconBg="#eff6ff"
        iconColor="#2563EB"
        onViewAll={() => navigate('/corretora/proposals')}
        viewAllLabel="Ver todas"
      >
        <div style={{ padding: '4px 0' }}>
          <ProposalsOverview />
        </div>
      </SectionCard>
    </div>
  );
};

export default DashboardPage;
