import React, { useState, useEffect } from 'react';
import {
    Row, Col, Button, Tag, Typography, Spin, Empty,
    Modal, message, Tabs, Avatar, Badge
} from 'antd';
import {
    BankOutlined, CheckCircleOutlined, ClockCircleOutlined,
    CloseCircleOutlined, PlusOutlined, SendOutlined,
    DeleteOutlined, ReloadOutlined, ShopOutlined
} from '@ant-design/icons';
import corretoraService from '@services/corretora.service';

const { Title, Text, Paragraph } = Typography;

const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/api\/?$/, '');
const getLogoUrl = (path) => path ? (path.startsWith('http') ? path : `${apiBase}/storage/${path}`) : null;

const STATUS_MAP = {
    pendente:  { color: 'processing', label: 'Pendente',  icon: <ClockCircleOutlined /> },
    aprovada:  { color: 'success',    label: 'Aprovada',  icon: <CheckCircleOutlined /> },
    rejeitada: { color: 'error',      label: 'Rejeitada', icon: <CloseCircleOutlined /> },
    suspensa:  { color: 'default',    label: 'Suspensa',  icon: <CloseCircleOutlined /> },
};

const ParceiriasPage = () => {
    const [parceiras, setParceiras]           = useState([]);
    const [disponiveis, setDisponiveis]       = useState([]);
    const [loading, setLoading]               = useState(false);
    const [loadingDisp, setLoadingDisp]       = useState(false);
    const [solicitando, setSolicitando]       = useState(null);
    const [cancelando, setCancelando]         = useState(null);
    const [activeTab, setActiveTab]           = useState('parceiras');
    const [confirmModal, setConfirmModal]     = useState({ open: false, seguradora: null });

    const fetchParceiras = async () => {
        setLoading(true);
        try {
            const data = await corretoraService.getParceiras();
            setParceiras(data);
        } catch {
            message.error('Erro ao carregar parcerias.');
        } finally {
            setLoading(false);
        }
    };

    const fetchDisponiveis = async () => {
        setLoadingDisp(true);
        try {
            const data = await corretoraService.getSeguradoresDisponiveis();
            setDisponiveis(data);
        } catch {
            message.error('Erro ao carregar seguradoras.');
        } finally {
            setLoadingDisp(false);
        }
    };

    useEffect(() => {
        fetchParceiras();
        fetchDisponiveis();
    }, []);

    const handleSolicitar = async (seguradora) => {
        setSolicitando(seguradora.id_seguradora);
        try {
            await corretoraService.solicitarParceria(seguradora.id_seguradora);
            message.success('Solicitação enviada! Aguarde a aprovação da seguradora.');
            fetchParceiras();
            fetchDisponiveis();
        } catch (err) {
            message.error(err?.message || 'Erro ao enviar solicitação.');
        } finally {
            setSolicitando(null);
            setConfirmModal({ open: false, seguradora: null });
        }
    };

    const handleCancelar = async (parceiraId) => {
        setCancelando(parceiraId);
        try {
            await corretoraService.cancelarParceria(parceiraId);
            message.success('Solicitação cancelada.');
            fetchParceiras();
            fetchDisponiveis();
        } catch {
            message.error('Erro ao cancelar solicitação.');
        } finally {
            setCancelando(null);
        }
    };

    const pendentes  = parceiras.filter(p => p.status === 'pendente');
    const aprovadas  = parceiras.filter(p => p.status === 'aprovada');
    const rejeitadas = parceiras.filter(p => p.status === 'rejeitada');

    const ParceriaCard = ({ p }) => {
        const st = STATUS_MAP[p.status] || STATUS_MAP.pendente;
        return (
            <div style={{
                borderRadius: '20px',
                border: p.status === 'aprovada' ? '1.5px solid #bbf7d0' : p.status === 'pendente' ? '1.5px solid #bfdbfe' : '1.5px solid #fecaca',
                background: p.status === 'aprovada' ? '#f0fdf4' : p.status === 'pendente' ? '#eff6ff' : '#fff5f5',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <Avatar
                            size={48}
                            src={getLogoUrl(p.seguradora?.logo)}
                            icon={<BankOutlined />}
                            style={{ background: '#e2e8f0', flexShrink: 0 }}
                        />
                        <div>
                            <Text strong style={{ fontSize: '15px', display: 'block', color: '#0f172a' }}>
                                {p.seguradora?.nome}
                            </Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>{p.seguradora?.email}</Text>
                        </div>
                    </div>
                    <Tag icon={st.icon} color={st.color} style={{ borderRadius: '20px', fontWeight: 600 }}>
                        {st.label}
                    </Tag>
                </div>

                {p.status === 'aprovada' && (
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ background: '#fff', borderRadius: '10px', padding: '8px 14px', border: '1px solid #e2e8f0' }}>
                            <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>Comissão</Text>
                            <Text strong style={{ color: '#16a34a', fontSize: '14px' }}>
                                {parseFloat(p.comissao_percentagem || 0).toFixed(1)}%
                            </Text>
                        </div>
                        <div style={{ background: '#fff', borderRadius: '10px', padding: '8px 14px', border: '1px solid #e2e8f0' }}>
                            <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>Aprovada em</Text>
                            <Text strong style={{ fontSize: '13px' }}>
                                {p.data_aprovacao ? new Date(p.data_aprovacao).toLocaleDateString('pt-MZ') : '—'}
                            </Text>
                        </div>
                    </div>
                )}

                {p.status === 'rejeitada' && p.observacoes && (
                    <div style={{ background: '#fff5f5', borderRadius: '10px', padding: '10px 14px', border: '1px solid #fecaca' }}>
                        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>Motivo</Text>
                        <Text style={{ fontSize: '13px', color: '#dc2626' }}>{p.observacoes}</Text>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                    {p.status === 'pendente' && (
                        <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            loading={cancelando === p.id}
                            onClick={() => handleCancelar(p.id)}
                            style={{ borderRadius: '8px' }}
                        >
                            Cancelar
                        </Button>
                    )}
                    {p.status === 'rejeitada' && (
                        <Button
                            size="small"
                            type="primary"
                            icon={<SendOutlined />}
                            loading={solicitando === p.id_seguradora}
                            onClick={() => setConfirmModal({ open: true, seguradora: p.seguradora })}
                            style={{ borderRadius: '8px' }}
                        >
                            Reenviar Solicitação
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    const SeguradoraCard = ({ seg }) => (
        <div style={{
            borderRadius: '20px',
            border: '1.5px solid #e2e8f0',
            background: '#fff',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'box-shadow 0.2s',
        }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Avatar
                    size={52}
                    src={getLogoUrl(seg.logo)}
                    icon={<BankOutlined />}
                    style={{ background: '#eff6ff', flexShrink: 0, border: '1px solid #e2e8f0' }}
                />
                <div>
                    <Text strong style={{ fontSize: '15px', display: 'block', color: '#0f172a' }}>{seg.nome}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{seg.email}</Text>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1, background: '#f8fafc', borderRadius: '10px', padding: '8px 12px', textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>Seguros</Text>
                    <Text strong style={{ fontSize: '15px', color: '#2563eb' }}>{seg.seguros_count ?? '—'}</Text>
                </div>
            </div>

            <Button
                type="primary"
                icon={<PlusOutlined />}
                loading={solicitando === seg.id_seguradora}
                onClick={() => setConfirmModal({ open: true, seguradora: seg })}
                style={{ borderRadius: '12px', height: '40px', fontWeight: 700 }}
                block
            >
                Solicitar Parceria
            </Button>
        </div>
    );

    const tabItems = [
        {
            key: 'parceiras',
            label: (
                <span>
                    Minhas Parcerias
                    {aprovadas.length > 0 && (
                        <Badge count={aprovadas.length} style={{ marginLeft: 8, background: '#16a34a' }} />
                    )}
                </span>
            ),
            children: (
                <div>
                    {pendentes.length > 0 && (
                        <div style={{ marginBottom: '28px' }}>
                            <Text strong style={{ color: '#2563eb', display: 'block', marginBottom: '12px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Aguardando aprovação ({pendentes.length})
                            </Text>
                            <Row gutter={[16, 16]}>
                                {pendentes.map(p => (
                                    <Col xs={24} md={12} xl={8} key={p.id}>
                                        <ParceriaCard p={p} />
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )}

                    {aprovadas.length > 0 && (
                        <div style={{ marginBottom: '28px' }}>
                            <Text strong style={{ color: '#16a34a', display: 'block', marginBottom: '12px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Parcerias Ativas ({aprovadas.length})
                            </Text>
                            <Row gutter={[16, 16]}>
                                {aprovadas.map(p => (
                                    <Col xs={24} md={12} xl={8} key={p.id}>
                                        <ParceriaCard p={p} />
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )}

                    {rejeitadas.length > 0 && (
                        <div>
                            <Text strong style={{ color: '#dc2626', display: 'block', marginBottom: '12px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Rejeitadas ({rejeitadas.length})
                            </Text>
                            <Row gutter={[16, 16]}>
                                {rejeitadas.map(p => (
                                    <Col xs={24} md={12} xl={8} key={p.id}>
                                        <ParceriaCard p={p} />
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )}

                    {parceiras.length === 0 && !loading && (
                        <Empty
                            description="Ainda não tens parcerias com nenhuma seguradora"
                            style={{ padding: '60px 0' }}
                        >
                            <Button type="primary" onClick={() => setActiveTab('disponiveis')} icon={<ShopOutlined />} style={{ borderRadius: '10px' }}>
                                Ver Seguradoras Disponíveis
                            </Button>
                        </Empty>
                    )}
                </div>
            )
        },
        {
            key: 'disponiveis',
            label: (
                <span>
                    Seguradoras Disponíveis
                    {disponiveis.length > 0 && (
                        <Badge count={disponiveis.length} style={{ marginLeft: 8 }} />
                    )}
                </span>
            ),
            children: loadingDisp ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
            ) : disponiveis.length === 0 ? (
                <Empty description="Não há seguradoras disponíveis para solicitar parceria" style={{ padding: '60px 0' }} />
            ) : (
                <Row gutter={[16, 16]}>
                    {disponiveis.map(seg => (
                        <Col xs={24} md={12} xl={8} key={seg.id_seguradora}>
                            <SeguradoraCard seg={seg} />
                        </Col>
                    ))}
                </Row>
            )
        }
    ];

    return (
        <>
        <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <Title level={2} style={{ fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
                            Parcerias com Seguradoras
                        </Title>
                        <Text type="secondary">Solicite autorização para vender produtos de seguradoras parceiras</Text>
                    </div>
                    <Button icon={<ReloadOutlined />} onClick={() => { fetchParceiras(); fetchDisponiveis(); }} loading={loading}>
                        Atualizar
                    </Button>
                </div>

                {/* Stats */}
                <Row gutter={[16, 16]} style={{ marginBottom: '28px' }}>
                    {[
                        { label: 'Parcerias Ativas', value: aprovadas.length, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
                        { label: 'Pendentes',        value: pendentes.length,  color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
                        { label: 'Disponíveis',      value: disponiveis.length, color: '#7c3aed', bg: '#faf5ff', border: '#ddd6fe' },
                    ].map((s, i) => (
                        <Col xs={8} key={i}>
                            <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '16px', padding: '16px 20px' }}>
                                <Text type="secondary" style={{ fontSize: '12px' }}>{s.label}</Text>
                                <div style={{ fontSize: '28px', fontWeight: 900, color: s.color, lineHeight: 1.2 }}>{s.value}</div>
                            </div>
                        </Col>
                    ))}
                </Row>

                <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '80px 0' }}><Spin size="large" /></div>
                    ) : (
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            items={tabItems}
                            style={{ padding: '0 24px' }}
                            tabBarStyle={{ borderBottom: '1px solid #f1f5f9', paddingTop: '8px' }}
                        />
                    )}
                </div>
            </div>

            {/* Modal de confirmação de solicitação */}
            <Modal
                open={confirmModal.open}
                onCancel={() => setConfirmModal({ open: false, seguradora: null })}
                onOk={() => handleSolicitar(confirmModal.seguradora)}
                okText="Confirmar Solicitação"
                cancelText="Cancelar"
                confirmLoading={solicitando === confirmModal.seguradora?.id_seguradora}
                okButtonProps={{ style: { borderRadius: '10px', fontWeight: 700 } }}
                cancelButtonProps={{ style: { borderRadius: '10px' } }}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <SendOutlined style={{ color: '#2563eb' }} />
                        <span>Solicitar Parceria</span>
                    </div>
                }
            >
                <div style={{ padding: '8px 0' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                        <Avatar
                            size={48}
                            src={getLogoUrl(confirmModal.seguradora?.logo)}
                            icon={<BankOutlined />}
                            style={{ background: '#eff6ff' }}
                        />
                        <div>
                            <Text strong style={{ fontSize: '16px', display: 'block' }}>{confirmModal.seguradora?.nome}</Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>{confirmModal.seguradora?.email}</Text>
                        </div>
                    </div>
                    <Paragraph type="secondary" style={{ fontSize: '14px' }}>
                        Ao confirmar, será enviada uma solicitação de parceria à <strong>{confirmModal.seguradora?.nome}</strong>.
                        Só após a aprovação poderás vender os seus produtos de seguro.
                    </Paragraph>
                </div>
            </Modal>
        </>
    );
};

export default ParceiriasPage;
