import React, { useState, useEffect } from 'react';
import {
  Card, Tag, Button, Space, message, Table, Modal, Form, InputNumber,
  Input, DatePicker, Switch, Typography, Row, Col, Tabs
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, PlusOutlined,
  PoweroffOutlined, CheckCircleOutlined, CheckCircleFilled,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import seguroService from '../../../services/seguroService';
import { useAuth } from '../../../context/AuthContext';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text, Title, Paragraph } = Typography;

const fmt = (v) => parseFloat(v || 0).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' });

const COVERAGE_COLORS = [
  '#2563eb', '#7c3aed', '#dc2626', '#d97706',
  '#0891b2', '#059669', '#0f766e', '#4f46e5',
];

const DetalhesSeguro = () => {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const { user }  = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const [seguro,        setSeguro]        = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [modalPreco,    setModalPreco]    = useState(false);
  const [modalCobertura,setModalCobertura]= useState(false);
  const [formPreco]    = Form.useForm();
  const [formCobertura]= Form.useForm();
  const [usaValor,      setUsaValor]      = useState(false);
  const [activeTab,     setActiveTab]     = useState('overview');

  useEffect(() => { carregarSeguro(); }, [id]);

  const carregarSeguro = async () => {
    setLoading(true);
    try {
      const res = await seguroService.obterSeguro(id);
      setSeguro(res.data);
    } catch {
      message.error('Erro ao carregar detalhes do seguro');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoAprovacao = async (checked) => {
    try {
      await seguroService.atualizarSeguro(id, { auto_aprovacao: checked });
      message.success(`Auto-aprovação ${checked ? 'activada' : 'desactivada'}`);
      carregarSeguro();
    } catch {
      message.error('Erro ao actualizar configuração');
    }
  };

  const handleAtivarDesativar = async () => {
    try {
      if (seguro.status) {
        await seguroService.desativarSeguro(id);
        message.success('Seguro desactivado');
      } else {
        await seguroService.ativarSeguro(id);
        message.success('Seguro activado');
      }
      carregarSeguro();
    } catch {
      message.error('Erro ao alterar status');
    }
  };

  const handleAdicionarPreco = async (values) => {
    try {
      if (values.data_inicio) values.data_inicio = values.data_inicio.format('YYYY-MM-DD');
      if (values.data_fim)    values.data_fim    = values.data_fim.format('YYYY-MM-DD');
      await seguroService.adicionarPreco(id, values);
      message.success('Preço adicionado!');
      setModalPreco(false);
      formPreco.resetFields();
      carregarSeguro();
    } catch {
      message.error('Erro ao adicionar preço');
    }
  };

  const handleAdicionarCobertura = async (values) => {
    try {
      await seguroService.adicionarCobertura(id, values);
      message.success('Cobertura adicionada!');
      setModalCobertura(false);
      formCobertura.resetFields();
      carregarSeguro();
    } catch {
      message.error('Erro ao adicionar cobertura');
    }
  };

  // ── Loading / Not found ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 26 }}>🛡️</div>
          <Text type="secondary">A carregar detalhes...</Text>
        </div>
      </div>
    );
  }

  if (!seguro) {
    return (
      <div style={{ padding: 24 }}>
        <Card><Text>Seguro não encontrado.</Text></Card>
      </div>
    );
  }

  const coberturas = seguro.coberturas || [];
  const precos     = seguro.precos     || [];
  const precoAtual = seguro.preco_atual;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 48 }}>

      {/* ── Voltar ── */}
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/seguradora/seguros')}
        style={{ borderRadius: 10, fontWeight: 600, color: '#64748b', marginBottom: 20 }}>
        Voltar aos Seguros
      </Button>

      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0c1a4e 0%, #1e3a8a 60%, #1d4ed8 100%)',
        borderRadius: 24, padding: '32px 36px', color: '#fff', marginBottom: 20,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        flexWrap: 'wrap', gap: 20, boxShadow: '0 16px 40px rgba(30,58,138,0.25)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60,  right: -60,  width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: '40%', width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
            🛡️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
              <Tag style={{ background: seguro.status ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)', color: seguro.status ? '#4ade80' : '#f87171', border: `1px solid ${seguro.status ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`, borderRadius: 20, fontWeight: 700, fontSize: 11 }}>
                {seguro.status ? '● ACTIVO' : '● INACTIVO'}
              </Tag>
              {seguro.auto_aprovacao && (
                <Tag style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 20, fontWeight: 700, fontSize: 11 }}>
                  ⚡ AUTO-APROVAÇÃO
                </Tag>
              )}
            </div>
            <Title level={3} style={{ color: '#fff', margin: '0 0 8px', fontWeight: 800 }}>
              {seguro.seguro?.nome}
            </Title>
            <Space size={8} wrap>
              {seguro.seguro?.categoria?.descricao && (
                <Tag style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: 20 }}>
                  {seguro.seguro.categoria.descricao}
                </Tag>
              )}
              {seguro.seguro?.tipo?.descricao && (
                <Tag style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: 20 }}>
                  {seguro.seguro.tipo.descricao}
                </Tag>
              )}
            </Space>
          </div>
        </div>

        <Space wrap>
          <Button icon={<EditOutlined />} onClick={() => navigate(`/seguradora/seguros/${id}/editar`)}
            style={{ borderRadius: 10, height: 40, fontWeight: 600, background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}>
            Editar
          </Button>
          <Button danger={seguro.status} icon={seguro.status ? <PoweroffOutlined /> : <CheckCircleOutlined />}
            onClick={handleAtivarDesativar}
            style={{ borderRadius: 10, height: 40, fontWeight: 600 }}>
            {seguro.status ? 'Desactivar' : 'Activar'}
          </Button>
        </Space>
      </div>

      {/* ── Métricas ── */}
      <Row gutter={[14, 14]} style={{ marginBottom: 24 }}>
        {[
          { label: 'Prémio Mínimo',  value: fmt(seguro.premio_minimo),      icon: '💰', color: '#2563eb', bg: '#eff6ff' },
          { label: 'Coberturas',     value: coberturas.length,              icon: '🛡️', color: '#7c3aed', bg: '#faf5ff', suffix: coberturas.length === 1 ? 'cobertura' : 'coberturas' },
          { label: 'Preço em Vigor', value: precoAtual ? (precoAtual.usaValor ? fmt(precoAtual.premio_valor) : `${precoAtual.premio_percentagem}%`) : 'Não definido', icon: '📋', color: '#059669', bg: '#f0fdf4' },
          { label: 'Auto-Aprovação', value: seguro.auto_aprovacao ? 'Activada' : 'Manual', icon: seguro.auto_aprovacao ? '⚡' : '⏳', color: seguro.auto_aprovacao ? '#d97706' : '#64748b', bg: seguro.auto_aprovacao ? '#fffbeb' : '#f8fafc' },
        ].map((m, i) => (
          <Col xs={12} lg={6} key={i}>
            <div style={{ background: m.bg, borderRadius: 16, padding: '18px 20px', border: `1.5px solid ${m.color}20`, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ fontSize: 26, lineHeight: 1 }}>{m.icon}</div>
              <div>
                <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{m.label}</Text>
                <Text strong style={{ fontSize: 17, color: m.color, lineHeight: 1.2, display: 'block' }}>{m.value}</Text>
                {m.suffix && <Text type="secondary" style={{ fontSize: 11 }}>{m.suffix}</Text>}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* ── Tabs ── */}
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ padding: '0 24px' }}
          tabBarStyle={{ borderBottom: '1px solid #f1f5f9', marginBottom: 0 }}
          items={[

            /* ── Visão Geral ── */
            {
              key: 'overview',
              label: '📋 Visão Geral',
              children: (
                <div style={{ padding: '24px 24px 28px' }}>
                  {seguro.seguro?.descricao && (
                    <div style={{ background: '#f8fafc', borderRadius: 14, padding: '16px 20px', marginBottom: 24, borderLeft: '4px solid #2563eb' }}>
                      <Text strong style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 8 }}>Descrição do Produto</Text>
                      <Paragraph style={{ margin: 0, color: '#374151', fontSize: 14, lineHeight: 1.7 }}>
                        {seguro.seguro.descricao}
                      </Paragraph>
                    </div>
                  )}

                  <Row gutter={[14, 14]} style={{ marginBottom: 24 }}>
                    {[
                      { label: 'Nome do Seguro',    value: seguro.seguro?.nome },
                      { label: 'Categoria',         value: seguro.seguro?.categoria?.descricao, tag: true, color: 'blue' },
                      { label: 'Tipo',              value: seguro.seguro?.tipo?.descricao?.toUpperCase(), tag: true, color: 'cyan' },
                      { label: 'Prémio Mínimo',     value: fmt(seguro.premio_minimo), highlight: true },
                      { label: 'Valor Mínimo Dano', value: seguro.valor_minimo_dano ? fmt(seguro.valor_minimo_dano) : '—' },
                      { label: 'Status',            isStatus: true },
                    ].map((item, i) => (
                      <Col xs={24} sm={12} md={8} key={i}>
                        <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 16px', border: '1px solid #f1f5f9' }}>
                          <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{item.label}</Text>
                          {item.isStatus
                            ? <Tag color={seguro.status ? 'green' : 'red'} style={{ borderRadius: 8, fontWeight: 700 }}>{seguro.status ? 'Activo' : 'Inactivo'}</Tag>
                            : item.tag
                              ? <Tag color={item.color} style={{ borderRadius: 8, fontWeight: 600 }}>{item.value || 'N/A'}</Tag>
                              : <Text strong style={{ color: item.highlight ? '#2563eb' : '#0f172a', fontSize: 14 }}>{item.value || '—'}</Text>
                          }
                        </div>
                      </Col>
                    ))}
                  </Row>

                  {/* Auto-aprovação toggle */}
                  <div style={{
                    background: seguro.auto_aprovacao ? '#fffbeb' : '#f8fafc',
                    borderRadius: 14, padding: '18px 20px',
                    border: `1.5px solid ${seguro.auto_aprovacao ? '#fde68a' : '#e2e8f0'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
                  }}>
                    <div>
                      <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>⚡ Auto-Aprovação de Propostas</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {seguro.auto_aprovacao
                          ? 'As propostas são aprovadas instantaneamente, sem revisão manual.'
                          : 'Cada proposta requer revisão e aprovação manual da equipa.'}
                      </Text>
                    </div>
                    <Switch
                      checked={seguro.auto_aprovacao}
                      onChange={handleToggleAutoAprovacao}
                      checkedChildren="Activada"
                      unCheckedChildren="Manual"
                      style={{ minWidth: 86 }}
                    />
                  </div>
                </div>
              ),
            },

            /* ── Coberturas ── */
            {
              key: 'coberturas',
              label: `🛡️ Coberturas (${coberturas.length})`,
              children: (
                <div style={{ padding: '24px 24px 28px' }}>
                  {isSuperAdmin && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalCobertura(true)}
                        style={{ borderRadius: 10, fontWeight: 600, background: '#1e40af' }}>
                        Adicionar Cobertura
                      </Button>
                    </div>
                  )}

                  {coberturas.length > 0 ? (
                    <Row gutter={[14, 14]}>
                      {coberturas.map((cov, i) => {
                        const color = COVERAGE_COLORS[i % COVERAGE_COLORS.length];
                        return (
                          <Col xs={24} sm={12} lg={8} key={i}>
                            <div style={{ borderRadius: 16, padding: '20px', height: '100%', border: `1.5px solid ${color}20`, background: `${color}06`, display: 'flex', flexDirection: 'column', gap: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                                  🛡️
                                </div>
                                <Text strong style={{ fontSize: 13, color: '#0f172a', lineHeight: 1.5, display: 'block', flex: 1 }}>
                                  {cov.descricao}
                                </Text>
                              </div>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {(cov.franquia !== null && cov.franquia !== undefined) && (
                                  <div style={{ background: '#f1f5f9', borderRadius: 8, padding: '4px 10px', display: 'inline-flex', gap: 5 }}>
                                    <Text type="secondary" style={{ fontSize: 10, textTransform: 'uppercase' }}>Franquia</Text>
                                    <Text strong style={{ fontSize: 12 }}>{cov.franquia}%</Text>
                                  </div>
                                )}
                                {cov.valor_minimo && (
                                  <div style={{ background: '#f1f5f9', borderRadius: 8, padding: '4px 10px', display: 'inline-flex', gap: 5 }}>
                                    <Text type="secondary" style={{ fontSize: 10, textTransform: 'uppercase' }}>Mín.</Text>
                                    <Text strong style={{ fontSize: 12 }}>{fmt(cov.valor_minimo)}</Text>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Col>
                        );
                      })}
                    </Row>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>🛡️</div>
                      <Text type="secondary" style={{ fontSize: 14 }}>Nenhuma cobertura definida.</Text>
                      {isSuperAdmin && (
                        <div style={{ marginTop: 16 }}>
                          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalCobertura(true)}
                            style={{ borderRadius: 10, background: '#1e40af' }}>
                            Adicionar Primeira Cobertura
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ),
            },

            /* ── Tabela de Preços ── */
            {
              key: 'precos',
              label: '💰 Tabela de Preços',
              children: (
                <div style={{ padding: '24px 24px 28px' }}>
                  {precoAtual && (
                    <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)', borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                      <div>
                        <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: 6 }}>Preço Actual em Vigor</Text>
                        <div style={{ fontSize: 32, fontWeight: 900 }}>
                          {precoAtual.usaValor ? fmt(precoAtual.premio_valor) : `${precoAtual.premio_percentagem}%`}
                        </div>
                        <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
                          {precoAtual.usaValor ? 'Valor fixo' : 'do valor segurado'}
                          {' · Desde '}{dayjs(precoAtual.data_inicio).format('DD/MM/YYYY')}
                        </Text>
                      </div>
                      {precoAtual.valor && (
                        <div style={{ textAlign: 'right' }}>
                          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>Valor Base</Text>
                          <Text style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{fmt(precoAtual.valor)}</Text>
                        </div>
                      )}
                    </div>
                  )}

                  {isSuperAdmin && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalPreco(true)}
                        style={{ borderRadius: 10, fontWeight: 600, background: '#1e40af' }}>
                        Novo Preço
                      </Button>
                    </div>
                  )}

                  <Table
                    columns={[
                      {
                        title: 'Prémio', key: 'premio',
                        render: (_, r) => (
                          <Text strong style={{ color: '#2563eb', fontSize: 15 }}>
                            {r.usaValor ? `${fmt(r.premio_valor)} fixo` : `${r.premio_percentagem}%`}
                          </Text>
                        ),
                      },
                      {
                        title: 'Valor Base', dataIndex: 'valor', key: 'valor',
                        render: v => v ? fmt(v) : <Text type="secondary">—</Text>,
                      },
                      {
                        title: 'Vigência', key: 'vigencia',
                        render: (_, r) => (
                          <Space>
                            <Tag color="blue" style={{ borderRadius: 8 }}>{dayjs(r.data_inicio).format('DD/MM/YYYY')}</Tag>
                            <span style={{ color: '#94a3b8' }}>→</span>
                            {r.data_fim
                              ? <Tag style={{ borderRadius: 8 }}>{dayjs(r.data_fim).format('DD/MM/YYYY')}</Tag>
                              : <Tag color="green" style={{ borderRadius: 8, fontWeight: 700 }}>Actual</Tag>
                            }
                          </Space>
                        ),
                      },
                      ...(isSuperAdmin ? [{
                        title: 'Acção', key: 'acoes',
                        render: (_, r) => {
                          const pid = r.id_preco ?? r.id ?? r.idPreco;
                          return r.data_fim ? (
                            <Button size="small" style={{ borderRadius: 8 }} onClick={async () => {
                              try { await seguroService.ativarPreco(pid); message.success('Preço activado'); carregarSeguro(); }
                              catch { message.error('Erro ao activar preço'); }
                            }}>Activar</Button>
                          ) : (
                            <Button danger size="small" style={{ borderRadius: 8 }} onClick={() => {
                              Modal.confirm({
                                title: 'Desactivar preço?',
                                content: 'Isso encerrará a vigência deste preço.',
                                okText: 'Confirmar', cancelText: 'Cancelar',
                                onOk: async () => {
                                  try { await seguroService.desativarPreco(pid); message.success('Desactivado'); carregarSeguro(); }
                                  catch { message.error('Erro'); }
                                },
                              });
                            }}>Desactivar</Button>
                          );
                        },
                      }] : []),
                    ]}
                    dataSource={precos}
                    rowKey={r => r.id_preco ?? r.id ?? r.idPreco}
                    pagination={false}
                    size="middle"
                  />
                </div>
              ),
            },

            /* ── Preview do Cliente ── */
            {
              key: 'preview',
              label: '👁️ Preview do Cliente',
              children: (
                <div style={{ padding: '24px' }}>
                  <div style={{ background: '#eff6ff', borderRadius: 12, padding: '12px 16px', marginBottom: 24, border: '1.5px solid #bfdbfe' }}>
                    <Text style={{ color: '#1d4ed8', fontSize: 12 }}>
                      👁️ Esta é exactamente a visualização que os clientes têm ao escolher este seguro no processo de contratação.
                    </Text>
                  </div>

                  <div style={{ maxWidth: 680, margin: '0 auto' }}>
                    {/* Topo do card público */}
                    <div style={{ background: 'linear-gradient(135deg, #0c1a4e 0%, #1e3a8a 60%, #1d4ed8 100%)', borderRadius: '24px 24px 0 0', padding: 32, color: '#fff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                        <div>
                          <Tag style={{ background: 'rgba(74,222,128,0.2)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 20, fontWeight: 700, fontSize: 10, marginBottom: 12 }}>
                            ● DISPONÍVEL
                          </Tag>
                          <Title level={4} style={{ color: '#fff', margin: '0 0 10px', fontWeight: 800 }}>{seguro.seguro?.nome}</Title>
                          <Space size={6} wrap>
                            {seguro.seguro?.categoria?.descricao && (
                              <Tag style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: 20 }}>
                                {seguro.seguro.categoria.descricao}
                              </Tag>
                            )}
                            {seguro.auto_aprovacao && (
                              <Tag style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24', border: 'none', borderRadius: 20 }}>
                                ⚡ Aprovação Imediata
                              </Tag>
                            )}
                          </Space>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, display: 'block', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4 }}>A partir de</Text>
                          <div style={{ color: '#fff', fontSize: 28, fontWeight: 900 }}>{fmt(seguro.premio_minimo)}</div>
                          <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>/ano</Text>
                        </div>
                      </div>
                    </div>

                    {/* Corpo do card público */}
                    <div style={{ background: '#fff', borderRadius: '0 0 24px 24px', border: '1px solid #e2e8f0', borderTop: 'none', padding: 28 }}>
                      {seguro.seguro?.descricao && (
                        <Paragraph style={{ color: '#64748b', fontSize: 13, lineHeight: 1.8, marginBottom: 24 }}>
                          {seguro.seguro.descricao}
                        </Paragraph>
                      )}

                      <Text strong style={{ fontSize: 11, color: '#374151', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 14 }}>
                        Coberturas Incluídas
                      </Text>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
                        {coberturas.length > 0 ? coberturas.map((cov, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                            <CheckCircleFilled style={{ color: '#16a34a', fontSize: 14, marginTop: 2, flexShrink: 0 }} />
                            <div>
                              <Text strong style={{ fontSize: 13, color: '#0f172a', display: 'block' }}>{cov.descricao}</Text>
                              <div style={{ display: 'flex', gap: 12, marginTop: 3 }}>
                                {cov.franquia !== null && cov.franquia !== undefined && (
                                  <Text type="secondary" style={{ fontSize: 11 }}>Franquia: {cov.franquia}%</Text>
                                )}
                                {cov.valor_minimo && (
                                  <Text type="secondary" style={{ fontSize: 11 }}>Mín: {fmt(cov.valor_minimo)}</Text>
                                )}
                              </div>
                            </div>
                          </div>
                        )) : (
                          <Text type="secondary" style={{ fontSize: 13 }}>Coberturas a definir.</Text>
                        )}
                      </div>

                      {/* Botão desactivado — só mostra como ficaria */}
                      <Button type="primary" block size="large" disabled
                        style={{ borderRadius: 14, height: 50, fontSize: 15, fontWeight: 700, background: '#1e3a8a' }}>
                        🛡️ Contratar este Seguro
                      </Button>
                      <Text type="secondary" style={{ fontSize: 11, display: 'block', textAlign: 'center', marginTop: 8 }}>
                        Botão disponível na área do cliente
                      </Text>
                    </div>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* ── Modal: Adicionar Preço ── */}
      <Modal title="Adicionar Novo Preço" open={modalPreco}
        onCancel={() => { setModalPreco(false); formPreco.resetFields(); }}
        footer={null} width={520}>
        <Form form={formPreco} layout="vertical" onFinish={handleAdicionarPreco}
          initialValues={{ usaValor: false }} style={{ marginTop: 16 }}>
          <Form.Item label="Tipo de Prémio" name="usaValor" valuePropName="checked">
            <Switch checkedChildren="Valor Fixo" unCheckedChildren="Percentagem" onChange={setUsaValor} />
          </Form.Item>
          <Form.Item label="Prémio (%)" name="premio_percentagem" hidden={usaValor}>
            <InputNumber style={{ width: '100%' }} min={0} max={100} step={0.5} placeholder="Ex: 2.5" addonAfter="%" />
          </Form.Item>
          <Form.Item label="Prémio Fixo (MZN)" name="premio_valor" hidden={!usaValor}>
            <InputNumber style={{ width: '100%' }} min={0} step={100} placeholder="0.00"
              formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={v => v.replace(/\$\s?|(,*)/g, '')} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Data Início" name="data_inicio" rules={[{ required: true, message: 'Obrigatório' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Data Fim (opcional)" name="data_fim">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button onClick={() => { setModalPreco(false); formPreco.resetFields(); }}>Cancelar</Button>
            <Button type="primary" htmlType="submit" style={{ background: '#1e40af', borderRadius: 10 }}>Adicionar Preço</Button>
          </div>
        </Form>
      </Modal>

      {/* ── Modal: Adicionar Cobertura ── */}
      <Modal title="Adicionar Nova Cobertura" open={modalCobertura}
        onCancel={() => { setModalCobertura(false); formCobertura.resetFields(); }}
        footer={null} width={520}>
        <Form form={formCobertura} layout="vertical" onFinish={handleAdicionarCobertura} style={{ marginTop: 16 }}>
          <Form.Item label="Descrição da Cobertura" name="descricao" rules={[{ required: true, message: 'Obrigatório' }]}>
            <TextArea rows={3} placeholder="Ex: Cobertura contra roubo e furto do veículo" style={{ borderRadius: 10 }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Franquia (%)" name="franquia">
                <InputNumber style={{ width: '100%' }} min={0} max={100} step={0.1} placeholder="Ex: 10" addonAfter="%" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Valor Mínimo (MZN)" name="valor_minimo">
                <InputNumber style={{ width: '100%' }} min={0} step={100} placeholder="0.00"
                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={v => v.replace(/\$\s?|(,*)/g, '')} />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button onClick={() => { setModalCobertura(false); formCobertura.resetFields(); }}>Cancelar</Button>
            <Button type="primary" htmlType="submit" style={{ background: '#1e40af', borderRadius: 10 }}>Adicionar Cobertura</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DetalhesSeguro;
