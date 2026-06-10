import React, { useState, useEffect } from 'react';
import {
  Table, Button, Tag, Space, Input, Select, message, Spin, Row, Col, Typography
} from 'antd';
import {
  PlusOutlined, EyeOutlined, EditOutlined, PoweroffOutlined, CheckCircleOutlined,
  SearchOutlined, AppstoreOutlined, UnorderedListOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import seguroService from '../../../services/seguroService';

const { Text, Title } = Typography;
const { Option } = Select;

const fmt = (v) => parseFloat(v || 0).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' });

const ListaSeguros = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const [seguros, setSeguros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('cards');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 15, total: 0 });
  const [filtros, setFiltros] = useState({ status: null, tipo_seguro: null, id_categoria: null });
  const [categorias, setCategorias] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => { carregarCategorias(); }, []);
  useEffect(() => { carregarSeguros(); }, [filtros, pagination.current]);

  const carregarCategorias = async () => {
    try {
      const res = await seguroService.listarCategorias();
      setCategorias(res || []);
    } catch { }
  };

  const carregarSeguros = async () => {
    setLoading(true);
    try {
      const params = { ...filtros, per_page: pagination.pageSize, page: pagination.current };
      Object.keys(params).forEach(k => { if (params[k] == null) delete params[k]; });
      const res = await seguroService.listarSeguros(params);
      setSeguros(res.data || []);
      setPagination(prev => ({ ...prev, total: res.total || 0, current: res.current_page || 1 }));
    } catch {
      message.error('Erro ao carregar seguros');
    } finally {
      setLoading(false);
    }
  };

  const handleAtivarDesativar = async (id, statusAtual) => {
    try {
      if (statusAtual) {
        await seguroService.desativarSeguro(id);
        message.success('Seguro desativado');
      } else {
        await seguroService.ativarSeguro(id);
        message.success('Seguro ativado');
      }
      carregarSeguros();
    } catch {
      message.error('Erro ao alterar status');
    }
  };

  const filteredSeguros = seguros.filter(s => {
    if (!searchText) return true;
    const t = searchText.toLowerCase();
    return (
      s.seguro?.nome?.toLowerCase().includes(t) ||
      s.seguro?.categoria?.descricao?.toLowerCase().includes(t)
    );
  });

  const totalAtivos   = seguros.filter(s => s.status).length;
  const totalInativos = seguros.filter(s => !s.status).length;

  return (
    <div style={{ padding: '0 0 40px' }}>

      {/* ── Cabeçalho ── */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 900, color: '#0f172a' }}>Gestão de Seguros</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>Gerencie os produtos de seguro disponíveis no mercado</Text>
        </div>
        {isSuperAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/seguradora/seguros/criar')}
            style={{ background: '#1e3a8a', borderRadius: 10, height: 40, fontWeight: 700 }}>
            Criar Novo Seguro
          </Button>
        )}
      </div>

      {/* ── Estatísticas ── */}
      <Row gutter={[14, 14]} style={{ marginBottom: 24 }}>
        {[
          { label: 'Total de Seguros', value: pagination.total || seguros.length, icon: '📋', color: '#2563eb', bg: '#eff6ff' },
          { label: 'Activos',          value: totalAtivos,   icon: '✅', color: '#059669', bg: '#f0fdf4' },
          { label: 'Inactivos',        value: totalInativos, icon: '⏸️', color: '#dc2626', bg: '#fef2f2' },
          { label: 'Categorias',       value: categorias.length, icon: '🗂️', color: '#7c3aed', bg: '#faf5ff' },
        ].map((s, i) => (
          <Col xs={12} md={6} key={i}>
            <div style={{ background: s.bg, borderRadius: 14, padding: '16px 18px', border: `1px solid ${s.color}20`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 24 }}>{s.icon}</div>
              <div>
                <Text style={{ fontSize: 22, fontWeight: 900, color: s.color, display: 'block', lineHeight: 1.1 }}>{s.value}</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>{s.label}</Text>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* ── Filtros ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          placeholder="Pesquisar seguros..."
          allowClear
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 220, borderRadius: 10, height: 38 }}
        />
        <Select placeholder="Status" style={{ width: 140 }} allowClear
          onChange={v => setFiltros(p => ({ ...p, status: v }))}>
          <Option value={1}>Activo</Option>
          <Option value={0}>Inactivo</Option>
        </Select>
        <Select placeholder="Categoria" style={{ width: 200 }} allowClear
          onChange={v => setFiltros(p => ({ ...p, id_categoria: v }))}>
          {categorias.map(c => <Option key={c.id_categoria} value={c.id_categoria}>{c.descricao}</Option>)}
        </Select>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {[
            { id: 'cards', icon: <AppstoreOutlined /> },
            { id: 'table', icon: <UnorderedListOutlined /> },
          ].map(v => (
            <button key={v.id} onClick={() => setViewMode(v.id)} style={{
              width: 36, height: 36, borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer',
              background: viewMode === v.id ? '#1e3a8a' : '#f8fafc',
              color:      viewMode === v.id ? '#fff'    : '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
            }}>
              {v.icon}
            </button>
          ))}
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <Spin spinning={loading}>
        {viewMode === 'cards' ? (
          filteredSeguros.length > 0 ? (
            <Row gutter={[16, 16]}>
              {filteredSeguros.map(s => (
                <Col xs={24} sm={12} xl={8} key={s.id}>
                  <div
                    onClick={() => navigate(`/seguradora/seguros/${s.id}`)}
                    style={{
                      background: '#fff', borderRadius: 18, overflow: 'hidden', cursor: 'pointer',
                      border: `1.5px solid ${s.status ? '#e2e8f0' : '#fee2e2'}`,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.05)', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(30,58,138,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none'; }}
                  >
                    {/* Topo do card */}
                    <div style={{
                      background: s.status
                        ? 'linear-gradient(135deg, #1e3a8a, #1d4ed8)'
                        : '#f1f5f9',
                      padding: '18px 20px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 12, fontSize: 22, flexShrink: 0,
                          background: s.status ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          🛡️
                        </div>
                        <div>
                          <Text strong style={{ color: s.status ? '#fff' : '#64748b', fontSize: 14, display: 'block', lineHeight: 1.3 }}>
                            {s.seguro?.nome}
                          </Text>
                          {s.seguro?.categoria?.descricao && (
                            <Tag style={{
                              marginTop: 4, fontSize: 10, borderRadius: 12, border: 'none',
                              background: s.status ? 'rgba(255,255,255,0.15)' : '#e2e8f0',
                              color: s.status ? 'rgba(255,255,255,0.8)' : '#64748b',
                            }}>
                              {s.seguro.categoria.descricao}
                            </Tag>
                          )}
                        </div>
                      </div>
                      <Tag style={{
                        background: s.status ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.15)',
                        color: s.status ? '#4ade80' : '#f87171',
                        border: 'none', borderRadius: 20, fontWeight: 700, fontSize: 10, flexShrink: 0,
                      }}>
                        {s.status ? '● ACTIVO' : '● INACTIVO'}
                      </Tag>
                    </div>

                    {/* Corpo do card */}
                    <div style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, gap: 8 }}>
                        <div>
                          <Text type="secondary" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 2 }}>Prémio Mínimo</Text>
                          <Text strong style={{ fontSize: 16, color: '#1e3a8a' }}>{fmt(s.premio_minimo)}</Text>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <Text type="secondary" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 2 }}>Preço Actual</Text>
                          {s.preco_atual
                            ? <Text strong style={{ fontSize: 14, color: '#374151' }}>{fmt(s.preco_atual.valor)}</Text>
                            : <Tag color="orange" style={{ borderRadius: 8, fontSize: 10 }}>Sem preço</Tag>
                          }
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                        {s.seguro?.tipo?.descricao && (
                          <Tag color="cyan" style={{ borderRadius: 8, fontSize: 10 }}>{s.seguro.tipo.descricao.toUpperCase()}</Tag>
                        )}
                        {s.auto_aprovacao && (
                          <Tag color="gold" style={{ borderRadius: 8, fontSize: 10 }}>⚡ Auto-Aprovação</Tag>
                        )}
                        {s.coberturas?.length > 0 && (
                          <Tag style={{ borderRadius: 8, fontSize: 10, background: '#f0fdf4', color: '#059669', borderColor: '#bbf7d0' }}>
                            🛡️ {s.coberturas.length} cobertura{s.coberturas.length !== 1 ? 's' : ''}
                          </Tag>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                        <Button icon={<EyeOutlined />} size="small"
                          style={{ borderRadius: 8, flex: 1, fontWeight: 600 }}
                          onClick={() => navigate(`/seguradora/seguros/${s.id}`)}>
                          Ver Detalhes
                        </Button>
                        {isSuperAdmin && (
                          <Button icon={<EditOutlined />} size="small" style={{ borderRadius: 8 }}
                            onClick={() => navigate(`/seguradora/seguros/${s.id}/editar`)} />
                        )}
                        <Button
                          icon={s.status ? <PoweroffOutlined /> : <CheckCircleOutlined />}
                          size="small" danger={s.status} style={{ borderRadius: 8 }}
                          onClick={() => handleAtivarDesativar(s.id, s.status)}
                        />
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #e2e8f0', padding: '80px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
              <Title level={5} style={{ color: '#374151' }}>Nenhum seguro encontrado</Title>
              <Text type="secondary" style={{ fontSize: 13 }}>Ajuste os filtros ou crie um novo produto de seguro.</Text>
              {isSuperAdmin && (
                <div style={{ marginTop: 20 }}>
                  <Button type="primary" icon={<PlusOutlined />}
                    onClick={() => navigate('/seguradora/seguros/criar')}
                    style={{ background: '#1e3a8a', borderRadius: 10 }}>
                    Criar Primeiro Seguro
                  </Button>
                </div>
              )}
            </div>
          )
        ) : (
          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <Table
              columns={[
                {
                  title: 'Nome', dataIndex: ['seguro', 'nome'], key: 'nome',
                  render: (t, r) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: r.status ? '#eff6ff' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🛡️</div>
                      <Text strong style={{ color: '#0f172a' }}>{t}</Text>
                    </div>
                  )
                },
                {
                  title: 'Categoria', dataIndex: ['seguro', 'categoria', 'descricao'], key: 'cat',
                  render: v => <Tag color="blue" style={{ borderRadius: 8 }}>{v || 'N/A'}</Tag>
                },
                {
                  title: 'Tipo', dataIndex: ['seguro', 'tipo', 'descricao'], key: 'tipo',
                  render: v => <Tag color="cyan" style={{ borderRadius: 8 }}>{v?.toUpperCase() || 'N/A'}</Tag>
                },
                {
                  title: 'Prémio Mínimo', dataIndex: 'premio_minimo', key: 'premio',
                  render: v => <Text strong style={{ color: '#1e3a8a' }}>{fmt(v)}</Text>
                },
                {
                  title: 'Preço Actual', key: 'preco',
                  render: (_, r) => r.preco_atual ? fmt(r.preco_atual.valor) : <Tag color="orange" style={{ borderRadius: 8 }}>Sem preço</Tag>
                },
                {
                  title: 'Status', dataIndex: 'status', key: 'status',
                  render: v => <Tag color={v ? 'green' : 'red'} style={{ borderRadius: 8, fontWeight: 700 }}>{v ? 'ACTIVO' : 'INACTIVO'}</Tag>
                },
                {
                  title: 'Acções', key: 'acoes', width: 200,
                  render: (_, r) => (
                    <Space size="small">
                      <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/seguradora/seguros/${r.id}`)}>Ver</Button>
                      {isSuperAdmin && <Button type="link" icon={<EditOutlined />} onClick={() => navigate(`/seguradora/seguros/${r.id}/editar`)}>Editar</Button>}
                      <Button type="link" danger={r.status}
                        icon={r.status ? <PoweroffOutlined /> : <CheckCircleOutlined />}
                        onClick={() => handleAtivarDesativar(r.id, r.status)}>
                        {r.status ? 'Desativar' : 'Ativar'}
                      </Button>
                    </Space>
                  )
                },
              ]}
              dataSource={filteredSeguros}
              rowKey="id"
              pagination={{ ...pagination, showSizeChanger: true }}
              onChange={p => setPagination(prev => ({ ...prev, current: p.current, pageSize: p.pageSize }))}
              scroll={{ x: 1000 }}
            />
          </div>
        )}
      </Spin>
    </div>
  );
};

export default ListaSeguros;
