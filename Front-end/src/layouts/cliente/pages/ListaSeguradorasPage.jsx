import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Spin, Button, Tag, Input, Empty } from 'antd';
import {
    BankOutlined, ArrowLeftOutlined, SearchOutlined,
    PhoneOutlined, EnvironmentOutlined, CheckCircleFilled,
    SafetyCertificateFilled, ArrowRightOutlined, StarFilled,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ClienteLayout from '../Components/layouts/ClienteLayout';
import clienteService from '../../../services/cliente.service';

const { Text, Title, Paragraph } = Typography;

const fmt = (v) => parseFloat(v || 0).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' });

const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/api\/?$/, '');
const logoUrl  = (path) => (!path ? null : path.startsWith('http') ? path : `${apiBase}/storage/${path}`);

// Paleta de gradientes para cartões sem logo
const GRADIENTS = [
    'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
    'linear-gradient(135deg, #065f46, #059669)',
    'linear-gradient(135deg, #6b21a8, #7c3aed)',
    'linear-gradient(135deg, #9f1239, #e11d48)',
    'linear-gradient(135deg, #92400e, #d97706)',
    'linear-gradient(135deg, #0c4a6e, #0891b2)',
];

// ── Card de seguradora (vista inicial) ────────────────────────────────────────
const SeguradoraCard = ({ seg, idx, onSelect }) => {
    const src  = logoUrl(seg.logo);
    const grad = GRADIENTS[idx % GRADIENTS.length];
    const initials = (seg.nome || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

    return (
        <div
            onClick={() => onSelect(seg)}
            style={{
                borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
                background: '#fff', border: '1.5px solid #e2e8f0',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)', transition: 'all 0.22s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(30,58,138,0.13)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'; }}
        >
            {/* Topo */}
            <div style={{ height: 130, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                {src ? (
                    <img src={src} alt={seg.nome} style={{ maxHeight: 80, maxWidth: '80%', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }} />
                ) : (
                    <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontWeight: 800, fontSize: 26 }}>{initials}</span>
                    </div>
                )}
                {seg.verificado && (
                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircleFilled style={{ color: '#4ade80', fontSize: 11 }} />
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>Verificada</Text>
                    </div>
                )}
            </div>

            {/* Corpo */}
            <div style={{ padding: '16px 18px 18px' }}>
                <Text strong style={{ fontSize: 15, color: '#0f172a', display: 'block', marginBottom: 10, lineHeight: 1.3 }}>{seg.nome}</Text>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                    {seg.telefone1 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <PhoneOutlined style={{ color: '#94a3b8', fontSize: 12 }} />
                            <Text type="secondary" style={{ fontSize: 12 }}>{seg.telefone1}</Text>
                        </div>
                    )}
                    {seg.endereco && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                            <EnvironmentOutlined style={{ color: '#94a3b8', fontSize: 12, marginTop: 1 }} />
                            <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.4 }}>{seg.endereco}</Text>
                        </div>
                    )}
                </div>

                <Button type="primary" block icon={<ArrowRightOutlined />}
                    style={{ borderRadius: 10, fontWeight: 700, background: '#1e3a8a', height: 38 }}>
                    Ver Seguros
                </Button>
            </div>
        </div>
    );
};

// ── Card de produto de seguro ─────────────────────────────────────────────────
const SeguroCard = ({ s, onContratar }) => {
    const coverages = s.coberturas || s.seguro?.coberturas || [];
    const nome      = s.seguro?.nome  || s.nome  || '—';
    const desc      = s.seguro?.descricao || s.descricao || '';
    const cat       = s.seguro?.categoria?.descricao || s.categoria?.descricao || null;
    const tipo      = s.seguro?.tipo?.descricao      || s.tipo?.descricao      || null;
    const autoAp    = s.auto_aprovacao;
    const premio    = s.premio_minimo;

    return (
        <div style={{
            borderRadius: 20, overflow: 'hidden', background: '#fff',
            border: '1.5px solid #e2e8f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
            display: 'flex', flexDirection: 'column', transition: 'all 0.22s',
        }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(30,58,138,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none'; }}
        >
            {/* Topo gradiente */}
            <div style={{ background: 'linear-gradient(135deg, #0c1a4e 0%, #1e3a8a 60%, #1d4ed8 100%)', padding: '20px 22px 18px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                            {cat  && <Tag style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: 20, fontSize: 10 }}>{cat}</Tag>}
                            {tipo && <Tag style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: 20, fontSize: 10 }}>{tipo}</Tag>}
                            {autoAp && <Tag style={{ background: 'rgba(251,191,36,0.22)', color: '#fbbf24', border: 'none', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>⚡ Auto-aprovação</Tag>}
                        </div>
                        <Text strong style={{ color: '#fff', fontSize: 15, lineHeight: 1.4, display: 'block' }}>{nome}</Text>
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                        🛡️
                    </div>
                </div>
            </div>

            {/* Corpo */}
            <div style={{ padding: '18px 22px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {desc && (
                    <Paragraph style={{ margin: 0, color: '#64748b', fontSize: 12.5, lineHeight: 1.7 }} ellipsis={{ rows: 3 }}>
                        {desc}
                    </Paragraph>
                )}

                {/* Coberturas */}
                {coverages.length > 0 && (
                    <div>
                        <Text type="secondary" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 8 }}>Coberturas</Text>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                            {coverages.slice(0, 6).map((c, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f0fdf4', borderRadius: 8, padding: '3px 9px', border: '1px solid #bbf7d0' }}>
                                    <CheckCircleFilled style={{ color: '#16a34a', fontSize: 10 }} />
                                    <Text style={{ fontSize: 11, color: '#15803d', fontWeight: 600 }}>
                                        {c.descricao || c}
                                    </Text>
                                </div>
                            ))}
                            {coverages.length > 6 && (
                                <div style={{ background: '#f1f5f9', borderRadius: 8, padding: '3px 9px' }}>
                                    <Text type="secondary" style={{ fontSize: 11 }}>+{coverages.length - 6} mais</Text>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div style={{ flex: 1 }} />

                {/* Prémio + botão */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                    {premio && (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
                            <Text type="secondary" style={{ fontSize: 11 }}>A partir de</Text>
                            <Text strong style={{ fontSize: 20, color: '#1e3a8a', letterSpacing: '-0.5px' }}>{fmt(premio)}</Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>/ano</Text>
                        </div>
                    )}
                    <Button type="primary" block size="large" icon={<SafetyCertificateFilled />}
                        onClick={() => onContratar(s)}
                        style={{ borderRadius: 12, height: 44, fontWeight: 700, background: '#1e3a8a', fontSize: 14 }}>
                        Contratar este Seguro
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ── Página principal ──────────────────────────────────────────────────────────
const ListaSeguradorasPage = () => {
    const navigate = useNavigate();
    const [seguradoras,     setSeguradoras]     = useState([]);
    const [loading,         setLoading]         = useState(true);
    const [selected,        setSelected]        = useState(null);  // seguradora seleccionada
    const [seguros,         setSeguros]         = useState([]);
    const [loadingSeguros,  setLoadingSeguros]  = useState(false);
    const [search,          setSearch]          = useState('');

    useEffect(() => {
        clienteService.getSeguradoras()
            .then(r => setSeguradoras(r.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSelect = async (seg) => {
        setSelected(seg);
        setSeguros([]);
        setLoadingSeguros(true);
        try {
            const r = await clienteService.getSegurosDaSeguradora(seg.id_seguradora);
            setSeguros(r.data || []);
        } catch { setSeguros([]); }
        finally { setLoadingSeguros(false); }
    };

    const handleVoltar = () => { setSelected(null); setSeguros([]); setSearch(''); };

    const handleContratar = (seguro) => {
        navigate('/cliente/contratar', { state: { seguradora: selected, seguro } });
    };

    const filteredSeguradoras = seguradoras.filter(s =>
        !search || s.nome?.toLowerCase().includes(search.toLowerCase())
    );

    const filteredSeguros = seguros.filter(s => {
        if (!search) return true;
        const t = search.toLowerCase();
        return (s.seguro?.nome || s.nome || '').toLowerCase().includes(t) ||
               (s.seguro?.categoria?.descricao || '').toLowerCase().includes(t);
    });

    // ── Vista: detalhe de uma seguradora ──────────────────────────────────────
    if (selected) {
        const src      = logoUrl(selected.logo);
        const initials = (selected.nome || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

        return (
            <ClienteLayout>
                {/* Voltar */}
                <Button icon={<ArrowLeftOutlined />} onClick={handleVoltar}
                    style={{ borderRadius: 10, fontWeight: 600, color: '#64748b', marginBottom: 20 }}>
                    Todas as Seguradoras
                </Button>

                {/* Hero da seguradora */}
                <div style={{
                    background: 'linear-gradient(135deg, #0c1a4e 0%, #1e3a8a 60%, #1d4ed8 100%)',
                    borderRadius: 24, padding: '28px 32px', marginBottom: 28,
                    display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
                    boxShadow: '0 16px 40px rgba(30,58,138,0.22)', position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

                    {/* Logo */}
                    <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                        {src
                            ? <img src={src} alt={selected.nome} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            : <span style={{ color: '#fff', fontWeight: 800, fontSize: 28 }}>{initials}</span>
                        }
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                            <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 800 }}>{selected.nome}</Title>
                            {selected.verificado && (
                                <Tag style={{ background: 'rgba(74,222,128,0.2)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 20, fontWeight: 700, fontSize: 10 }}>
                                    ● Verificada
                                </Tag>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                            {selected.telefone1 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <PhoneOutlined style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }} />
                                    <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>{selected.telefone1}</Text>
                                </div>
                            )}
                            {selected.endereco && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <EnvironmentOutlined style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }} />
                                    <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>{selected.endereco}</Text>
                                </div>
                            )}
                            {selected.email && (
                                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{selected.email}</Text>
                            )}
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: 4 }}>Seguros Disponíveis</Text>
                        <div style={{ color: '#fff', fontSize: 32, fontWeight: 900 }}>{seguros.length}</div>
                    </div>
                </div>

                {/* Pesquisa + header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <Text strong style={{ fontSize: 16, color: '#0f172a' }}>Produtos disponíveis</Text>
                        <Text type="secondary" style={{ fontSize: 13, marginLeft: 8 }}>Escolha o seguro ideal para si</Text>
                    </div>
                    <Input
                        prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                        placeholder="Pesquisar seguros..."
                        allowClear
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: 220, borderRadius: 10, height: 38 }}
                    />
                </div>

                {/* Grid de seguros */}
                {loadingSeguros ? (
                    <div style={{ textAlign: 'center', padding: '80px 0' }}>
                        <Spin size="large" />
                        <div style={{ marginTop: 16, color: '#64748b' }}>A carregar seguros...</div>
                    </div>
                ) : filteredSeguros.length > 0 ? (
                    <Row gutter={[20, 20]}>
                        {filteredSeguros.map((s, i) => (
                            <Col xs={24} sm={12} xl={8} key={s.id || i}>
                                <SeguroCard s={s} onContratar={handleContratar} />
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '80px 40px', textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
                        <Text strong style={{ fontSize: 16, color: '#374151', display: 'block', marginBottom: 8 }}>
                            Nenhum seguro disponível
                        </Text>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            Esta seguradora ainda não tem produtos publicados.
                        </Text>
                    </div>
                )}
            </ClienteLayout>
        );
    }

    // ── Vista: lista de todas as seguradoras ──────────────────────────────────
    return (
        <ClienteLayout>
            {/* Cabeçalho */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                    <div>
                        <Title level={4} style={{ margin: '0 0 4px', fontWeight: 900, color: '#0f172a' }}>Seguradoras Parceiras</Title>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            Conheça as seguradoras disponíveis e escolha a protecção ideal para si.
                        </Text>
                    </div>
                    <Input
                        prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                        placeholder="Pesquisar seguradora..."
                        allowClear
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: 220, borderRadius: 10, height: 38 }}
                    />
                </div>

                {/* Estatística rápida */}
                {!loading && (
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <div style={{ background: '#eff6ff', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BankOutlined style={{ color: '#2563eb' }} />
                            <Text style={{ color: '#2563eb', fontWeight: 700, fontSize: 13 }}>{seguradoras.length} seguradoras</Text>
                        </div>
                        <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <CheckCircleFilled style={{ color: '#16a34a', fontSize: 13 }} />
                            <Text style={{ color: '#15803d', fontWeight: 700, fontSize: 13 }}>
                                {seguradoras.filter(s => s.verificado).length} verificadas
                            </Text>
                        </div>
                    </div>
                )}
            </div>

            {/* Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16, color: '#64748b' }}>A carregar seguradoras...</div>
                </div>
            ) : filteredSeguradoras.length > 0 ? (
                <Row gutter={[20, 20]}>
                    {filteredSeguradoras.map((seg, i) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={seg.id_seguradora || i}>
                            <SeguradoraCard seg={seg} idx={i} onSelect={handleSelect} />
                        </Col>
                    ))}
                </Row>
            ) : (
                <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '80px 40px', textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🏦</div>
                    <Text strong style={{ fontSize: 16, color: '#374151', display: 'block', marginBottom: 8 }}>
                        Nenhuma seguradora encontrada
                    </Text>
                    <Text type="secondary" style={{ fontSize: 13 }}>Tente ajustar a pesquisa.</Text>
                </div>
            )}
        </ClienteLayout>
    );
};

export default ListaSeguradorasPage;
