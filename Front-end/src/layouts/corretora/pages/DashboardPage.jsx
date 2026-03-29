// src/layouts/corretora/pages/DashboardPage.jsx
import { useAuth } from '@context/AuthContext';
import { Row, Col, Typography, Alert, Button } from 'antd';
import {
  SafetyCertificateOutlined,
  ArrowRightOutlined,
  PlusOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import StatsCards from '../components/StatsCards';
import ProposalsOverview from '../components/ProposalsOverview';
import RecentActivity from '../components/RecentActivity';
import corretoraService from '@services/corretora.service';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const DashboardPage = () => {
  const { user, entidade } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStatus = async () => {
        try {
            const status = await corretoraService.getVerificacaoStatus();
            setVerificationStatus(status);
        } catch (error) {
            console.error('Erro ao buscar status de verificação:', error);
        } finally {
            setLoadingStatus(false);
        }
    };
    fetchStatus();
  }, []);

  const getCurrentDateFormatted = () => {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return new Date().toLocaleDateString('pt-BR', options);
  };

  return (
    <div style={{ padding: '0 8px', background: 'transparent' }}>
      {/* Premium Header/Greeting */}
      <div style={{ 
        marginBottom: '40px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '24px',
        padding: '16px 24px',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        boxShadow: '0 4px 24px -8px rgba(37, 99, 235, 0.12)',
        border: '1px solid rgba(255, 255, 255, 0.8)'
      }}>
        <div>
          <Title level={2} style={{ 
            margin: 0, 
            fontWeight: 800, 
            background: 'linear-gradient(90deg, #1e293b 0%, #334155 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif'
          }}>
            Dashboard de Negócios
          </Title>
          <Text style={{ color: '#64748b', fontWeight: 500, fontSize: '15px' }}>
            {getCurrentDateFormatted()} • Bem-vindo de volta ao seu painel.
          </Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => navigate('/corretora/proposals/create')}
          style={{ 
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            borderColor: 'transparent',
            height: '48px',
            padding: '0 28px',
            borderRadius: '16px',
            fontWeight: 700,
            fontSize: '15.5px',
            boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
             e.currentTarget.style.transform = 'translateY(-2px)';
             e.currentTarget.style.boxShadow = '0 12px 20px -4px rgba(37, 99, 235, 0.5)';
          }}
          onMouseLeave={(e) => {
             e.currentTarget.style.transform = 'translateY(0)';
             e.currentTarget.style.boxShadow = '0 8px 16px -4px rgba(37, 99, 235, 0.4)';
          }}
        >
          Nova Proposta
        </Button>
      </div>

      {/* Verification Alert - Premium Styling (Glass Card) */}
      {verificationStatus?.status_verificacao !== 'aprovado' && !loadingStatus && (
        <div style={{
            marginBottom: '40px',
            padding: '32px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(253, 230, 138, 0.3) 0%, rgba(254, 243, 199, 0.1) 100%)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(245, 158, 11, 0.08)',
            display: 'flex',
            gap: '24px',
            alignItems: 'flex-start'
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                borderRadius: '50%',
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
                flexShrinks: 0
            }}>
                <SafetyCertificateOutlined style={{ fontSize: '28px', color: '#fff' }} />
            </div>
            
            <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: '#92400e' }}>
                    {verificationStatus?.status_verificacao === 'pendente' 
                        ? 'Verificação em Análise' 
                        : 'Ação Necessária: Complete seu Perfil'}
                </h3>
                <p style={{ margin: '0 0 20px 0', color: '#78350f', fontSize: '15px', lineHeight: 1.6, fontWeight: 500 }}>
                    {verificationStatus?.status_verificacao === 'pendente'
                        ? 'Sua documentação já foi enviada e está passando por análise rigorosa da nossa equipe. Em breve você terá acesso total à plataforma.'
                        : 'Para iniciar suas atividades de cotação e fechar propostas reais, submeta seus documentos legais. Este processo garante a segurança do nosso ecossistema.'}
                </p>
                {verificationStatus?.status_verificacao !== 'pendente' && (
                    <Button 
                        type="primary" 
                        icon={<ArrowRightOutlined />}
                        onClick={() => navigate('/corretora/perfil/verificacao')}
                        style={{ 
                            borderRadius: '12px', 
                            background: '#92400e', 
                            borderColor: '#92400e', 
                            fontWeight: 700,
                            height: '44px',
                            padding: '0 24px',
                            boxShadow: '0 4px 12px rgba(146, 64, 14, 0.3)'
                        }}
                    >
                    Iniciar Verificação
                    </Button>
                )}
            </div>
        </div>
      )}

      {/* Stats Cards Section */}
      <div style={{ marginBottom: '40px' }}>
        <StatsCards />
      </div>

      {/* Content Grid */}
      <Row gutter={[32, 32]}>
        <Col xs={24} lg={16}>
          <div style={{ 
            background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
            borderRadius: '24px', 
            padding: '32px',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                 <Title level={4} style={{ margin: 0, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                    Últimas Propostas
                 </Title>
                 <Text style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Resumo de suas negociações em andamento</Text>
              </div>
              <Button type="link" onClick={() => navigate('/corretora/proposals')} style={{ fontWeight: 700, color: '#2563EB', padding: 0 }}>
                  Ver Todas <ArrowRightOutlined style={{ fontSize: '12px' }} />
              </Button>
            </div>
            <ProposalsOverview />
          </div>
        </Col>
        
        <Col xs={24} lg={8}>
          <div style={{ 
            background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
            borderRadius: '24px', 
            padding: '32px',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <Title level={4} style={{ margin: 0, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                <HistoryOutlined style={{ marginRight: 12, color: '#2563EB' }} />
                Atividade
              </Title>
            </div>
            <div style={{ flex: 1 }}>
                <RecentActivity />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
