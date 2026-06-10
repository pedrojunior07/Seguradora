import React, { useState, useEffect } from 'react';
import {
  Button, message, Row, Col, Typography, Spin, Input,
  Avatar, Tag, Empty, Form, Upload
} from 'antd';
import {
  CarOutlined, CheckCircleOutlined, CheckCircleFilled,
  SafetyCertificateFilled, FileTextOutlined, PlusOutlined,
  ArrowRightOutlined, LockOutlined, SyncOutlined, StarFilled,
  ArrowLeftOutlined, BankOutlined, UploadOutlined, DollarOutlined,
  FilterOutlined, MobileOutlined, CreditCardOutlined, SearchOutlined,
  RocketOutlined, ThunderboltOutlined, HomeOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import ClienteLayout from '../Components/layouts/ClienteLayout';
import clienteService from '../../../services/cliente.service';
import { useAuth } from '../../../context/AuthContext';

const { Title, Text, Paragraph } = Typography;
const fmt = (v) => parseFloat(v || 0).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' });

// ── Constantes ────────────────────────────────────────────────────────────────

const STEP_LABELS = ['Veículo', 'Cobertura', 'Comparar', 'Cotação', 'Dados', 'Documentos', 'Pagamento'];

const COVERAGES = [
  { id: 'terceiros',       icon: '🤝', label: 'Terceiros',              color: '#059669', desc: 'Cobre danos causados a terceiros — pessoas e veículos. Obrigatório por lei.' },
  { id: 'roubo',          icon: '🔐', label: 'Roubo e Furto',           color: '#7c3aed', desc: 'Protege contra roubo total ou parcial do veículo.' },
  { id: 'incendio',       icon: '🔥', label: 'Incêndio',                color: '#dc2626', desc: 'Cobre danos por incêndio, raio ou explosão.' },
  { id: 'danos_proprios', icon: '🚗', label: 'Danos Próprios',          color: '#d97706', desc: 'Cobre danos ao seu veículo em acidentes, independente da culpa.' },
  { id: 'assistencia',    icon: '🛣️', label: 'Assistência em Viagem',   color: '#0891b2', desc: 'Reboque, troca de pneu, combustível e carro substituto.' },
  { id: 'vidros',         icon: '🪟', label: 'Vidros',                  color: '#4f46e5', desc: 'Cobre quebra de para-brisas, janelas e retrovisores.' },
  { id: 'internacional',  icon: '🌍', label: 'Cobertura Internacional', color: '#0f766e', desc: 'Extensão da cobertura para viagens ao exterior.' },
  { id: 'completo',       icon: '🛡️', label: 'Seguro Completo',         color: '#2563eb', desc: 'Todas as coberturas: danos próprios, terceiros, roubo, incêndio e assistência.' },
];

const PACKAGES = [
  {
    id: 'basico',
    label: 'Básico',
    emoji: '🔵',
    desc: 'Protecção essencial exigida por lei',
    coverages: ['terceiros'],
    color: '#059669',
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  {
    id: 'standard',
    label: 'Standard',
    emoji: '⭐',
    desc: 'Equilíbrio ideal entre preço e cobertura',
    coverages: ['terceiros', 'roubo', 'incendio', 'vidros', 'assistencia'],
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    recommended: true,
  },
  {
    id: 'premium',
    label: 'Premium',
    emoji: '💎',
    desc: 'Cobertura máxima sem preocupações',
    coverages: ['completo', 'terceiros', 'roubo', 'incendio', 'danos_proprios', 'assistencia', 'vidros', 'internacional'],
    color: '#7c3aed',
    bgColor: '#faf5ff',
    borderColor: '#ddd6fe',
  },
];

const ASSISTANT_QUESTIONS = [
  {
    id: 'orcamento',
    question: 'Qual é o seu orçamento mensal para o seguro?',
    options: [
      { id: 'baixo',  label: 'Até 2 000 MZN',    icon: '💚', profile: 'basico' },
      { id: 'medio',  label: '2 000 – 8 000 MZN', icon: '💛', profile: 'standard' },
      { id: 'alto',   label: 'Acima de 8 000 MZN',icon: '💜', profile: 'premium' },
    ],
  },
  {
    id: 'uso',
    question: 'Como utiliza o veículo?',
    options: [
      { id: 'diario',    label: 'Uso diário / trabalho',  icon: '🏙️' },
      { id: 'ocasional', label: 'Uso ocasional / lazer',  icon: '🌴' },
      { id: 'comercial', label: 'Uso comercial / frota',  icon: '🚚' },
    ],
  },
  {
    id: 'prioridade',
    question: 'O que prioriza mais?',
    options: [
      { id: 'preco',     label: 'Menor preço',           icon: '💰' },
      { id: 'cobertura', label: 'Máxima cobertura',      icon: '🛡️' },
      { id: 'equilibrio',label: 'Equilíbrio perfeito',   icon: '⚖️' },
    ],
  },
];

const DOC_TYPES = [
  { id: 'bi',        label: 'Bilhete de Identidade / Passaporte', required: true },
  { id: 'livrete',   label: 'Livrete do Veículo',                 required: true },
  { id: 'conducao',  label: 'Carta de Condução',                  required: true },
  { id: 'foto_frente',label: 'Foto Frente do Veículo',            required: false },
  { id: 'foto_tras', label: 'Foto Traseira do Veículo',           required: false },
  { id: 'inspecao',  label: 'Relatório de Inspecção',             required: false },
];

const PAYMENT_METHODS = [
  { id: 'mpesa',        label: 'M-Pesa',       icon: <MobileOutlined />,    color: '#e11d48', desc: 'Pagamento imediato via M-Pesa' },
  { id: 'emola',        label: 'E-Mola',        icon: <MobileOutlined />,    color: '#f59e0b', desc: 'Pagamento imediato via E-Mola' },
  { id: 'cartao',       label: 'Cartão',         icon: <CreditCardOutlined />,color: '#2563eb', desc: 'Visa, Mastercard ou cartão local' },
  { id: 'transferencia',label: 'Transferência',  icon: <BankOutlined />,      color: '#059669', desc: 'Transferência bancária (1–2 dias úteis)' },
];

// ── Indicador de Progresso ────────────────────────────────────────────────────

const ProgressIndicator = ({ current, labels }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', marginBottom: '36px', overflowX: 'auto', padding: '4px 0' }}>
    {labels.map((label, i) => {
      const done   = i < current;
      const active = i === current;
      return (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '52px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: done ? '#16a34a' : active ? '#2563eb' : '#f1f5f9',
              border: `2px solid ${done ? '#16a34a' : active ? '#2563eb' : '#e2e8f0'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.35s',
              boxShadow: active ? '0 0 0 5px rgba(37,99,235,0.12)' : done ? '0 0 0 3px rgba(22,163,74,0.1)' : 'none',
              flexShrink: 0,
            }}>
              {done
                ? <CheckCircleFilled style={{ color: '#fff', fontSize: '13px' }} />
                : <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: active ? '#fff' : '#d1d5db', transition: 'all 0.35s' }} />
              }
            </div>
            <Text style={{ fontSize: '10px', color: done ? '#16a34a' : active ? '#2563eb' : '#9ca3af', fontWeight: active ? 700 : 400, whiteSpace: 'nowrap' }}>
              {label}
            </Text>
          </div>
          {i < labels.length - 1 && (
            <div style={{ flex: 1, height: '2px', minWidth: '16px', maxWidth: '48px', background: done ? '#16a34a' : '#e2e8f0', transition: 'background 0.4s', margin: '15px 4px 0' }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ── Componente Principal ──────────────────────────────────────────────────────

const ContratarSeguroPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, entidade } = useAuth();
  const { seguro: preSelectedSeguro } = location.state || {};

  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Dados
  const [veiculos, setVeiculos]                     = useState([]);
  const [segurosDisponiveis, setSegurosDisponiveis]  = useState([]);

  // Selecções por passo
  const [selectedVehicle, setSelectedVehicle]       = useState(null);
  const [selectedCoverages, setSelectedCoverages]   = useState([]);
  const [selectedPackage, setSelectedPackage]       = useState(null);
  const [selectedPlan, setSelectedPlan]             = useState(preSelectedSeguro || null);
  const [cotacao, setCotacao]                       = useState(null);
  const [simulating, setSimulating]                 = useState(false);
  const [uploadedDocs, setUploadedDocs]             = useState({});
  const [paymentMethod, setPaymentMethod]           = useState(null);

  // Assistente inteligente
  const [assistantAnswers, setAssistantAnswers]     = useState({});
  const [assistantStep, setAssistantStep]           = useState(0);
  const [assistantDone, setAssistantDone]           = useState(false);
  const [recommendedPackage, setRecommendedPackage] = useState(null);

  // Filtro/ordenação na comparação
  const [filterMode, setFilterMode]                 = useState('recomendado');
  const [searchPlan, setSearchPlan]                 = useState('');

  // Formulário de dados pessoais
  const [form] = Form.useForm();

  // Sucesso
  const [finished, setFinished]     = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  // ── Carga inicial ────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [vRes, sRes] = await Promise.all([
          clienteService.getMeusVeiculos(),
          clienteService.getSegurosDisponiveis(),
        ]);
        setVeiculos(vRes.data || []);
        setSegurosDisponiveis(sRes.data || []);
      } catch {
        message.error('Erro ao carregar dados.');
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, []);

  // Pré-preenche formulário de dados
  useEffect(() => {
    if (current === 4 && entidade) {
      form.setFieldsValue({
        nome:     user?.name || entidade?.nome,
        email:    user?.email || entidade?.email,
        telefone: entidade?.telefone1,
        nuit:     entidade?.nuit,
        endereco: entidade?.endereco,
        documento: entidade?.documento,
      });
    }
  }, [current, entidade, user, form]);

  // Cotação automática ao entrar no passo 3
  useEffect(() => {
    if (current === 3 && selectedPlan && selectedVehicle) {
      setSimulating(true);
      setCotacao(null);
      clienteService.simularCotacao({
        id_seguradora_seguro: selectedPlan.id_seguradora_seguro || selectedPlan.id,
        valor_bem: selectedVehicle.valor_estimado,
      }).then(setCotacao).catch(console.error).finally(() => setSimulating(false));
    }
  }, [current]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAssistantAnswer = (questionId, answer) => {
    const updated = { ...assistantAnswers, [questionId]: answer };
    setAssistantAnswers(updated);
    if (assistantStep < ASSISTANT_QUESTIONS.length - 1) {
      setAssistantStep(s => s + 1);
    } else {
      // Determina pacote recomendado
      const profile = updated.orcamento;
      const rec = profile === 'baixo' ? 'basico' : profile === 'alto' ? 'premium' : 'standard';
      setRecommendedPackage(rec);
      if (updated.prioridade === 'preco')     setRecommendedPackage('basico');
      if (updated.prioridade === 'cobertura') setRecommendedPackage('premium');
      setAssistantDone(true);
    }
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg.id);
    setSelectedCoverages(pkg.coverages);
  };

  const toggleCoverage = (id) => {
    setSelectedCoverages(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
    setSelectedPackage(null);
  };

  const handleContratar = async () => {
    setLoading(true);
    try {
      const res = await clienteService.enviarProposta({
        id_seguradora_seguro: selectedPlan.id_seguradora_seguro || selectedPlan.id,
        valor_bem: selectedVehicle.valor_estimado,
        id_bem: selectedVehicle.id_veiculo,
        tipo_bem: 'veiculo',
        coberturas: selectedCoverages,
        metodo_pagamento: paymentMethod,
      });
      setSuccessInfo(res);
      setFinished(true);
    } catch {
      message.error('Erro ao enviar proposta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => { setCurrent(c => c + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const goBack = () => current === 0 ? navigate('/cliente/dashboard') : setCurrent(c => c - 1);

  // Planos filtrados para comparação
  const filteredPlans = segurosDisponiveis
    .filter(s => {
      const t = searchPlan.toLowerCase();
      return (!t || s.seguro?.nome?.toLowerCase().includes(t) || s.seguradora?.nome?.toLowerCase().includes(t))
        && (s.seguro?.categoria?.descricao?.toLowerCase().includes('auto') || s.seguro?.categoria?.descricao?.toLowerCase().includes('veiculo'));
    })
    .sort((a, b) => {
      if (filterMode === 'barato')    return (a.premio_minimo || 0) - (b.premio_minimo || 0);
      if (filterMode === 'avaliacao') return (b.seguradora?.rating || 0) - (a.seguradora?.rating || 0);
      if (filterMode === 'franquia')  return (a.franquia || 0) - (b.franquia || 0);
      return (b.seguradora?.rating || 0) - (a.seguradora?.rating || 0); // recomendado
    });

  const canNext = [
    !!selectedVehicle,
    selectedCoverages.length > 0,
    !!selectedPlan,
    !!cotacao,
    true,
    true,
    !!paymentMethod,
  ][current] ?? false;

  // ── Ecrã de Sucesso ──────────────────────────────────────────────────────
  if (finished) {
    return (
      <ClienteLayout>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 20px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0c1a4e 0%, #1e3a8a 60%, #1d4ed8 100%)',
            borderRadius: '28px', padding: '56px 40px', textAlign: 'center',
            marginBottom: '24px', position: 'relative', overflow: 'hidden',
            boxShadow: '0 24px 48px rgba(30,58,138,0.3)',
          }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '2px solid rgba(255,255,255,0.2)', boxShadow: '0 0 0 12px rgba(96,165,250,0.1)' }}>
              <SafetyCertificateFilled style={{ fontSize: '38px', color: '#60a5fa' }} />
            </div>
            <div style={{ color: '#93c5fd', fontSize: '11px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '10px' }}>Proposta Enviada</div>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: '26px', lineHeight: 1.3, marginBottom: '12px' }}>A sua protecção está a caminho!</div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 32px' }}>
              A seguradora irá analisar a sua proposta. Será notificado por e-mail e no sistema assim que houver uma actualização.
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button size="large" onClick={() => navigate('/cliente/dashboard')} icon={<HomeOutlined />}
                style={{ borderRadius: '12px', height: '46px', padding: '0 28px', fontWeight: 700, background: '#fff', color: '#1e3a8a', border: 'none' }}>
                Dashboard
              </Button>
              <Button size="large" onClick={() => navigate('/cliente/minhas-propostas')} icon={<FileTextOutlined />}
                style={{ borderRadius: '12px', height: '46px', padding: '0 28px', fontWeight: 600, background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}>
                Acompanhar Proposta
              </Button>
            </div>
          </div>
          {/* Resumo */}
          <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
            <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '16px' }}>Resumo da Proposta</Text>
            <Row gutter={[12, 12]}>
              {[
                { label: 'Número', value: `#${successInfo?.data?.numero_proposta || 'AGUARDANDO'}` },
                { label: 'Veículo', value: `${selectedVehicle?.marca} ${selectedVehicle?.modelo}` },
                { label: 'Plano', value: selectedPlan?.seguro?.nome },
                { label: 'Prémio', value: fmt(successInfo?.data?.premio_calculado || cotacao?.premio_final), highlight: true },
                { label: 'Seguradora', value: selectedPlan?.seguradora?.nome },
                { label: 'Status', status: true },
              ].map((item, i) => (
                <Col xs={24} sm={12} key={i}>
                  <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px 14px' }}>
                    <Text type="secondary" style={{ fontSize: '10px', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</Text>
                    {item.status
                      ? <Tag icon={<SyncOutlined spin />} color="gold" style={{ fontWeight: 700 }}>Em Análise</Tag>
                      : <Text strong style={{ color: item.highlight ? '#2563eb' : '#0f172a' }}>{item.value}</Text>
                    }
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      </ClienteLayout>
    );
  }

  // ── Conteúdo de cada passo ────────────────────────────────────────────────
  const stepConfig = [

    // ── PASSO 0 — VEÍCULO ────────────────────────────────────────────────────
    {
      title: 'Qual veículo deseja segurar?',
      subtitle: 'Seleccione um veículo da sua lista ou adicione um novo',
      content: (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <Text type="secondary" style={{ fontSize: '13px' }}>{veiculos.length} veículo(s) disponível(is)</Text>
            <Button icon={<PlusOutlined />} onClick={() => navigate('/cliente/veiculos')}
              style={{ borderRadius: '10px', fontWeight: 600, height: '36px', fontSize: '13px' }}>
              Adicionar Veículo
            </Button>
          </div>

          {veiculos.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {veiculos.map((v, idx) => {
                const sel = selectedVehicle?.id_veiculo === v.id_veiculo;
                return (
                  <div key={v.id_veiculo} onClick={() => setSelectedVehicle(v)} style={{
                    display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px',
                    borderRadius: '12px', cursor: 'pointer', transition: 'all 0.18s',
                    background: sel ? '#eff6ff' : idx % 2 === 0 ? '#f8fafc' : '#fff',
                    border: `1.5px solid ${sel ? '#2563eb' : 'transparent'}`,
                  }}>
                    {/* Radio */}
                    <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, border: `2px solid ${sel ? '#2563eb' : '#d1d5db'}`, background: sel ? '#2563eb' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s' }}>
                      {sel && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
                    </div>
                    <CarOutlined style={{ fontSize: '18px', color: sel ? '#2563eb' : '#94a3b8', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: '14px', color: '#0f172a' }}>{v.marca} {v.modelo}</Text>
                      <div style={{ display: 'flex', gap: '14px', marginTop: '2px' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{v.matricula}</Text>
                        {v.cor && <Text type="secondary" style={{ fontSize: '12px' }}>{v.cor}</Text>}
                        <Text type="secondary" style={{ fontSize: '12px' }}>{v.ano_fabrico}</Text>
                      </div>
                    </div>
                    <Text strong style={{ fontSize: '14px', color: sel ? '#2563eb' : '#374151', flexShrink: 0 }}>
                      {fmt(v.valor_estimado)}
                    </Text>
                  </div>
                );
              })}
            </div>
          ) : (
            <Empty description="Nenhum veículo cadastrado" style={{ padding: '60px 0' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/cliente/veiculos')} style={{ borderRadius: '10px' }}>
                Cadastrar Veículo
              </Button>
            </Empty>
          )}
        </>
      ),
    },

    // ── PASSO 1 — COBERTURA ──────────────────────────────────────────────────
    {
      title: 'O que quer proteger?',
      subtitle: 'Escolha as coberturas ou seleccione um pacote pronto',
      content: (
        <>
          {/* Assistente inteligente */}
          {!assistantDone ? (
            <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', borderRadius: '20px', padding: '28px', marginBottom: '28px', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <RocketOutlined style={{ fontSize: '20px', color: '#93c5fd' }} />
                <Text style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>Assistente de Recomendação</Text>
                <Tag style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '11px' }}>
                  {assistantStep + 1} / {ASSISTANT_QUESTIONS.length}
                </Tag>
              </div>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px', display: 'block', marginBottom: '18px', fontWeight: 500 }}>
                {ASSISTANT_QUESTIONS[assistantStep].question}
              </Text>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {ASSISTANT_QUESTIONS[assistantStep].options.map(opt => (
                  <div key={opt.id} onClick={() => handleAssistantAnswer(ASSISTANT_QUESTIONS[assistantStep].id, opt.id)}
                    style={{ flex: 1, minWidth: '120px', background: 'rgba(255,255,255,0.12)', borderRadius: '14px', padding: '14px 16px', cursor: 'pointer', textAlign: 'center', border: '1.5px solid rgba(255,255,255,0.2)', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>{opt.icon}</div>
                    <Text style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{opt.label}</Text>
                  </div>
                ))}
              </div>
              <Button type="link" onClick={() => setAssistantDone(true)} style={{ color: 'rgba(255,255,255,0.5)', marginTop: '14px', padding: 0, fontSize: '12px' }}>
                Saltar assistente →
              </Button>
            </div>
          ) : recommendedPackage && (
            <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '14px', padding: '14px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ThunderboltOutlined style={{ color: '#16a34a', fontSize: '18px' }} />
              <div>
                <Text strong style={{ color: '#15803d', fontSize: '13px' }}>Recomendação do assistente: </Text>
                <Text style={{ color: '#15803d', fontSize: '13px' }}>
                  Pacote <strong>{PACKAGES.find(p => p.id === recommendedPackage)?.label}</strong> — ideal para o seu perfil.
                </Text>
              </div>
            </div>
          )}

          {/* Pacotes */}
          <Text strong style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '14px' }}>Pacotes Prontos</Text>
          <Row gutter={[14, 14]} style={{ marginBottom: '28px' }}>
            {PACKAGES.map(pkg => {
              const sel = selectedPackage === pkg.id;
              const isRec = pkg.id === recommendedPackage;
              return (
                <Col xs={24} sm={8} key={pkg.id}>
                  <div onClick={() => handleSelectPackage(pkg)} style={{
                    borderRadius: '16px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                    border: sel ? `2px solid ${pkg.color}` : isRec ? `2px dashed ${pkg.color}` : '1.5px solid #e2e8f0',
                    background: sel ? pkg.bgColor : '#fff',
                    boxShadow: sel ? `0 4px 16px ${pkg.color}20` : 'none',
                  }}>
                    {isRec && !sel && (
                      <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: pkg.color, color: '#fff', fontSize: '9px', fontWeight: 800, padding: '2px 10px', borderRadius: '20px', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                        RECOMENDADO
                      </div>
                    )}
                    {sel && <CheckCircleFilled style={{ position: 'absolute', top: 12, right: 12, color: pkg.color, fontSize: '18px' }} />}
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{pkg.emoji}</div>
                    <Text strong style={{ fontSize: '16px', color: '#0f172a', display: 'block' }}>{pkg.label}</Text>
                    <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '12px' }}>{pkg.desc}</Text>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {pkg.coverages.map(cid => {
                        const cov = COVERAGES.find(c => c.id === cid);
                        return cov ? (
                          <span key={cid} style={{ fontSize: '10px', background: `${pkg.color}15`, color: pkg.color, padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>
                            {cov.icon} {cov.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>

          {/* Coberturas individuais */}
          <Text strong style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '14px' }}>Ou personalize a sua cobertura</Text>
          <Row gutter={[10, 10]}>
            {COVERAGES.map(cov => {
              const sel = selectedCoverages.includes(cov.id);
              return (
                <Col xs={24} sm={12} md={8} key={cov.id}>
                  <div onClick={() => toggleCoverage(cov.id)} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.18s',
                    border: sel ? `1.5px solid ${cov.color}` : '1.5px solid #e2e8f0',
                    background: sel ? `${cov.color}08` : '#f8fafc',
                  }}>
                    <div style={{ width: 20, height: 20, borderRadius: '4px', border: `2px solid ${sel ? cov.color : '#d1d5db'}`, background: sel ? cov.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', transition: 'all 0.18s' }}>
                      {sel && <CheckCircleOutlined style={{ color: '#fff', fontSize: '11px' }} />}
                    </div>
                    <div>
                      <Text strong style={{ fontSize: '13px', color: '#0f172a' }}>{cov.icon} {cov.label}</Text>
                      <Text type="secondary" style={{ fontSize: '11px', display: 'block', lineHeight: 1.4 }}>{cov.desc}</Text>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </>
      ),
    },

    // ── PASSO 2 — COMPARAÇÃO ─────────────────────────────────────────────────
    {
      title: 'Compare as seguradoras',
      subtitle: 'Encontrámos os melhores planos para a sua cobertura',
      content: (
        <>
          {/* Filtros */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <FilterOutlined style={{ color: '#94a3b8' }} />
            {[
              { id: 'recomendado', label: '⭐ Recomendado' },
              { id: 'barato',      label: '💰 Mais Barato' },
              { id: 'avaliacao',   label: '🏆 Melhor Avaliação' },
              { id: 'franquia',    label: '📉 Menor Franquia' },
            ].map(f => (
              <button key={f.id} onClick={() => setFilterMode(f.id)} style={{
                padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.18s',
                background: filterMode === f.id ? '#2563eb' : '#f1f5f9',
                color: filterMode === f.id ? '#fff' : '#64748b',
              }}>
                {f.label}
              </button>
            ))}
            <Input
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Pesquisar..."
              allowClear
              value={searchPlan}
              onChange={e => setSearchPlan(e.target.value)}
              style={{ width: '180px', borderRadius: '10px', height: '36px', marginLeft: 'auto' }}
            />
          </div>

          {/* Coberturas seleccionadas */}
          {selectedCoverages.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <Text type="secondary" style={{ fontSize: '12px', alignSelf: 'center' }}>Cobertura:</Text>
              {selectedCoverages.map(cid => {
                const cov = COVERAGES.find(c => c.id === cid);
                return cov ? <Tag key={cid} style={{ borderRadius: '20px', fontSize: '11px' }}>{cov.icon} {cov.label}</Tag> : null;
              })}
            </div>
          )}

          {/* Lista de planos */}
          {filteredPlans.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredPlans.map((s, idx) => {
                const sel = selectedPlan?.id === s.id;
                return (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px',
                    borderRadius: '14px', border: sel ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                    background: sel ? '#eff6ff' : idx % 2 === 0 ? '#f8fafc' : '#fff',
                    transition: 'all 0.2s', cursor: 'pointer', flexWrap: 'wrap',
                    boxShadow: sel ? '0 4px 16px rgba(37,99,235,0.12)' : 'none',
                  }} onClick={() => setSelectedPlan(s)}>

                    {idx === 0 && !sel && (
                      <div style={{ position: 'absolute', fontSize: '10px' }} />
                    )}

                    {/* Radio */}
                    <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, border: `2px solid ${sel ? '#2563eb' : '#d1d5db'}`, background: sel ? '#2563eb' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s' }}>
                      {sel && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
                    </div>

                    {/* Logo */}
                    <Avatar size={40} src={s.seguradora?.logotipo} icon={<BankOutlined />}
                      style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', flexShrink: 0 }} />

                    {/* Info */}
                    <div style={{ flex: 2, minWidth: '140px' }}>
                      <Text strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>{s.seguro?.nome}</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>{s.seguradora?.nome}</Text>
                    </div>

                    {/* Avaliação */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: '50px' }}>
                      <StarFilled style={{ color: '#f59e0b', fontSize: '13px' }} />
                      <Text style={{ fontSize: '13px', fontWeight: 600 }}>{(s.seguradora?.rating || 4.5).toFixed(1)}</Text>
                    </div>

                    {/* Categoria */}
                    {s.seguro?.categoria?.descricao && (
                      <Tag style={{ borderRadius: '8px', fontSize: '11px' }}>{s.seguro.categoria.descricao}</Tag>
                    )}

                    {/* Preço */}
                    <div style={{ textAlign: 'right', minWidth: '120px' }}>
                      <Text type="secondary" style={{ fontSize: '10px', display: 'block' }}>A partir de</Text>
                      <Text strong style={{ fontSize: '17px', color: sel ? '#2563eb' : '#0f172a' }}>{fmt(s.premio_minimo)}</Text>
                      <Text type="secondary" style={{ fontSize: '10px', display: 'block' }}>/ano</Text>
                    </div>

                    {/* Botão */}
                    <Button
                      type={sel ? 'primary' : 'default'} size="small"
                      icon={sel ? <CheckCircleOutlined /> : <ArrowRightOutlined />}
                      onClick={e => { e.stopPropagation(); setSelectedPlan(s); }}
                      style={{ borderRadius: '8px', fontWeight: 700, borderColor: sel ? '#2563eb' : '#e2e8f0', flexShrink: 0 }}
                    >
                      {sel ? 'Seleccionado' : 'Seleccionar'}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <Empty description="Nenhum plano encontrado" style={{ padding: '60px 0' }} />
          )}
        </>
      ),
    },

    // ── PASSO 3 — COTAÇÃO ────────────────────────────────────────────────────
    {
      title: 'Detalhes e cotação',
      subtitle: 'Reveja o plano seleccionado antes de prosseguir',
      content: simulating ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px', color: '#64748b', fontSize: '14px' }}>A calcular a sua cotação...</div>
        </div>
      ) : cotacao ? (
        <Row gutter={[24, 20]}>
          <Col xs={24} lg={15}>
            {/* Veículo */}
            <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <CarOutlined style={{ color: '#2563eb' }} />
                <Text strong>Veículo</Text>
              </div>
              <Row gutter={[12, 12]}>
                {[
                  { l: 'Marca / Modelo', v: `${selectedVehicle?.marca} ${selectedVehicle?.modelo}` },
                  { l: 'Matrícula',      v: selectedVehicle?.matricula },
                  { l: 'Ano',            v: selectedVehicle?.ano_fabrico },
                  { l: 'Valor Segurado', v: fmt(selectedVehicle?.valor_estimado), h: true },
                ].map((item, i) => (
                  <Col xs={12} key={i}>
                    <Text type="secondary" style={{ fontSize: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>{item.l}</Text>
                    <Text strong style={{ color: item.h ? '#2563eb' : '#0f172a', fontSize: '13px' }}>{item.v}</Text>
                  </Col>
                ))}
              </Row>
            </div>

            {/* Plano */}
            <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', marginBottom: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Avatar size={44} src={selectedPlan?.seguradora?.logotipo} icon={<BankOutlined />} style={{ border: '1px solid #e2e8f0', background: '#e2e8f0', flexShrink: 0 }} />
              <div>
                <Text strong style={{ fontSize: '15px', display: 'block' }}>{selectedPlan?.seguro?.nome}</Text>
                <Text type="secondary" style={{ fontSize: '13px' }}>{selectedPlan?.seguradora?.nome}</Text>
              </div>
            </div>

            {/* Coberturas */}
            {cotacao.detalhes_cobertura?.length > 0 && (
              <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
                <Text strong style={{ fontSize: '13px', display: 'block', marginBottom: '14px' }}>Coberturas Incluídas</Text>
                <Row gutter={[8, 8]}>
                  {cotacao.detalhes_cobertura.map((c, i) => (
                    <Col xs={24} sm={12} key={i}>
                      <div style={{ display: 'flex', gap: '8px', background: '#fff', borderRadius: '10px', padding: '10px 12px', border: '1px solid #e2e8f0' }}>
                        <CheckCircleFilled style={{ color: '#16a34a', fontSize: '13px', marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <Text strong style={{ fontSize: '12px', display: 'block' }}>{c.descricao}</Text>
                          <Text type="secondary" style={{ fontSize: '11px' }}>Franquia: {c.franquia}%</Text>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </Col>

          {/* Resumo financeiro */}
          <Col xs={24} lg={9}>
            <div style={{ background: 'linear-gradient(180deg, #1e3a8a, #1d4ed8)', borderRadius: '20px', padding: '24px', position: 'sticky', top: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <DollarOutlined style={{ color: '#93c5fd', fontSize: '16px' }} />
                <Text style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>Resumo Financeiro</Text>
              </div>
              {[
                { l: 'Prémio Base',       v: fmt(cotacao.premio_base) },
                { l: 'Taxas Admin.',      v: fmt(cotacao.taxas) },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>{item.l}</Text>
                  <Text style={{ color: '#fff', fontWeight: 600, fontSize: '13px' }}>{item.v}</Text>
                </div>
              ))}
              {cotacao.desconto > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>Desconto</Text>
                  <Text style={{ color: '#4ade80', fontWeight: 600, fontSize: '13px' }}>-{cotacao.desconto}%</Text>
                </div>
              )}
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', textAlign: 'center', margin: '8px 0 20px' }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Total Anual</Text>
                <div style={{ color: '#fff', fontSize: '28px', fontWeight: 900 }}>{fmt(cotacao.premio_final)}</div>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>/ano · {fmt(cotacao.premio_final / 12)}/mês</Text>
              </div>
              <Row gutter={[6, 6]}>
                {['M-Pesa', 'E-Mola', 'Cartão', 'Transferência'].map((m, i) => (
                  <Col span={12} key={i}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px', textAlign: 'center' }}>
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>{m}</Text>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </Col>
        </Row>
      ) : (
        <Empty description="Não foi possível calcular a cotação" style={{ padding: '60px 0' }} />
      ),
    },

    // ── PASSO 4 — DADOS PESSOAIS ─────────────────────────────────────────────
    {
      title: 'Os seus dados',
      subtitle: 'Verifique e complete as suas informações pessoais',
      content: (
        <div style={{ maxWidth: '600px' }}>
          <Form form={form} layout="vertical" size="large">
            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item name="nome" label="Nome Completo" rules={[{ required: true }]}>
                  <Input placeholder="João Silva" style={{ borderRadius: '10px' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="documento" label="BI / Passaporte" rules={[{ required: true }]}>
                  <Input placeholder="0123456789A" style={{ borderRadius: '10px' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="nuit" label="NUIT" rules={[{ required: true }]}>
                  <Input placeholder="123456789" style={{ borderRadius: '10px' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="telefone" label="Telefone" rules={[{ required: true }]}>
                  <Input placeholder="+258 84 000 0000" style={{ borderRadius: '10px' }} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="email" label="E-mail" rules={[{ required: true, type: 'email' }]}>
                  <Input placeholder="joao@email.com" style={{ borderRadius: '10px' }} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="endereco" label="Endereço">
                  <Input placeholder="Av. Julius Nyerere, 123, Maputo" style={{ borderRadius: '10px' }} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '12px 16px', border: '1px solid #bbf7d0', marginTop: '8px' }}>
            <Text style={{ color: '#15803d', fontSize: '12px' }}>
              🔒 Os seus dados são protegidos e usados exclusivamente para a emissão da apólice.
            </Text>
          </div>
        </div>
      ),
    },

    // ── PASSO 5 — DOCUMENTOS ─────────────────────────────────────────────────
    {
      title: 'Documentos necessários',
      subtitle: 'Faça o upload dos documentos para agilizar a aprovação',
      content: (
        <Row gutter={[14, 14]}>
          {DOC_TYPES.map(doc => {
            const uploaded = uploadedDocs[doc.id];
            return (
              <Col xs={24} sm={12} key={doc.id}>
                <Upload
                  beforeUpload={file => {
                    setUploadedDocs(prev => ({ ...prev, [doc.id]: file }));
                    return false;
                  }}
                  showUploadList={false}
                  accept="image/*,.pdf"
                >
                  <div style={{
                    borderRadius: '14px', border: uploaded ? '2px solid #16a34a' : '2px dashed #d1d5db',
                    padding: '20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
                    background: uploaded ? '#f0fdf4' : '#f8fafc',
                  }}>
                    {uploaded ? (
                      <CheckCircleFilled style={{ fontSize: '28px', color: '#16a34a', marginBottom: '8px' }} />
                    ) : (
                      <UploadOutlined style={{ fontSize: '28px', color: '#94a3b8', marginBottom: '8px' }} />
                    )}
                    <Text strong style={{ fontSize: '13px', color: uploaded ? '#15803d' : '#374151', display: 'block' }}>
                      {doc.label}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      {uploaded ? uploaded.name : `${doc.required ? 'Obrigatório' : 'Opcional'} · PDF ou imagem`}
                    </Text>
                  </div>
                </Upload>
              </Col>
            );
          })}
          <Col xs={24}>
            <div style={{ background: '#fffbeb', borderRadius: '10px', padding: '12px 16px', border: '1px solid #fde68a' }}>
              <Text style={{ color: '#92400e', fontSize: '12px' }}>
                💡 Pode avançar sem fazer upload agora. Os documentos podem ser enviados posteriormente na área de propostas.
              </Text>
            </div>
          </Col>
        </Row>
      ),
    },

    // ── PASSO 6 — PAGAMENTO ──────────────────────────────────────────────────
    {
      title: 'Forma de pagamento',
      subtitle: 'Escolha como pretende pagar o prémio do seguro',
      content: (
        <Row gutter={[24, 0]}>
          <Col xs={24} lg={14}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {PAYMENT_METHODS.map(pm => {
                const sel = paymentMethod === pm.id;
                return (
                  <div key={pm.id} onClick={() => setPaymentMethod(pm.id)} style={{
                    display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px',
                    borderRadius: '14px', border: sel ? `2px solid ${pm.color}` : '1.5px solid #e2e8f0',
                    background: sel ? `${pm.color}08` : '#fff', cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: sel ? `0 4px 14px ${pm.color}20` : 'none',
                  }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${sel ? pm.color : '#d1d5db'}`, background: sel ? pm.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.18s' }}>
                      {sel && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${pm.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: pm.color, flexShrink: 0 }}>
                      {pm.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>{pm.label}</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>{pm.desc}</Text>
                    </div>
                    {sel && <CheckCircleFilled style={{ color: pm.color, fontSize: '18px' }} />}
                  </div>
                );
              })}
            </div>
          </Col>

          {/* Resumo final */}
          <Col xs={24} lg={10}>
            <div style={{ background: '#f8fafc', borderRadius: '20px', border: '1.5px solid #e2e8f0', padding: '24px', position: 'sticky', top: '20px' }}>
              <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '18px' }}>Resumo Final</Text>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <Text type="secondary" style={{ fontSize: '13px' }}>Veículo</Text>
                <Text strong style={{ fontSize: '13px' }}>{selectedVehicle?.marca} {selectedVehicle?.modelo}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <Text type="secondary" style={{ fontSize: '13px' }}>Plano</Text>
                <Text strong style={{ fontSize: '13px' }}>{selectedPlan?.seguro?.nome}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <Text type="secondary" style={{ fontSize: '13px' }}>Seguradora</Text>
                <Text strong style={{ fontSize: '13px' }}>{selectedPlan?.seguradora?.nome}</Text>
              </div>

              <div style={{ height: '1px', background: '#e2e8f0', margin: '14px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Text strong style={{ fontSize: '15px' }}>Total Anual</Text>
                <Text strong style={{ fontSize: '22px', color: '#2563eb' }}>{fmt(cotacao?.premio_final)}</Text>
              </div>

              <Button
                type="primary" block size="large"
                icon={<SafetyCertificateFilled />}
                loading={loading}
                disabled={!paymentMethod}
                onClick={handleContratar}
                style={{ height: '50px', borderRadius: '14px', fontSize: '15px', fontWeight: 700, background: paymentMethod ? '#1e3a8a' : undefined }}
              >
                {paymentMethod ? 'Confirmar e Contratar' : 'Seleccione um método'}
              </Button>

              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <LockOutlined style={{ color: '#94a3b8', marginRight: '5px', fontSize: '11px' }} />
                <Text type="secondary" style={{ fontSize: '11px' }}>Transacção segura e encriptada</Text>
              </div>
            </div>
          </Col>
        </Row>
      ),
    },
  ];

  const step = stepConfig[current];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <ClienteLayout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={goBack}
            style={{ borderRadius: '10px', height: '38px', fontWeight: 600, color: '#64748b' }}>
            {current === 0 ? 'Dashboard' : 'Voltar'}
          </Button>
          <div style={{ width: 1, height: 20, background: '#e2e8f0' }} />
          <Title level={4} style={{ margin: 0, fontWeight: 900, color: '#0f172a' }}>Contratar Seguro Automóvel</Title>
        </div>

        {/* Progresso */}
        <ProgressIndicator current={current} labels={STEP_LABELS} />

        {/* Card do passo */}
        <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

          {/* Cabeçalho */}
          <div style={{ padding: '28px 36px 22px', borderBottom: '1px solid #f1f5f9' }}>
            <Title level={4} style={{ fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{step.title}</Title>
            <Text type="secondary" style={{ fontSize: '14px' }}>{step.subtitle}</Text>
          </div>

          {/* Conteúdo */}
          <div style={{ padding: '28px 36px' }}>
            {initialLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0' }}>
                <Spin size="large" />
                <Text type="secondary" style={{ marginTop: '16px' }}>A carregar...</Text>
              </div>
            ) : step.content}
          </div>

          {/* Navegação — só aparece nos passos sem botão interno de contratar */}
          {current < stepConfig.length - 1 && (
            <div style={{ padding: '18px 36px', borderTop: '1px solid #f1f5f9', background: '#fafbff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
              {current === 5 && (
                <Button onClick={goNext} style={{ borderRadius: '10px', height: '44px', color: '#64748b' }}>
                  Saltar documentos
                </Button>
              )}
              <Button
                type="primary" size="large" icon={<ArrowRightOutlined />}
                disabled={!canNext}
                onClick={goNext}
                style={{ borderRadius: '12px', height: '44px', padding: '0 36px', fontWeight: 700, background: canNext ? '#2563eb' : undefined, fontSize: '15px' }}
              >
                Continuar
              </Button>
            </div>
          )}
        </div>

      </div>
    </ClienteLayout>
  );
};

export default ContratarSeguroPage;
