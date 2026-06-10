import React, { useState, useEffect } from 'react';
import {
    Row, Col, Button, Tag, Typography, Spin, Empty,
    Modal, message, Tabs, Avatar, Badge, Form, InputNumber, Input, List, Tooltip
} from 'antd';
import {
    BankOutlined, CheckCircleOutlined, ClockCircleOutlined,
    CloseCircleOutlined, StopOutlined, ReloadOutlined,
    CheckOutlined, SafetyCertificateOutlined, FileProtectOutlined, EyeOutlined
} from '@ant-design/icons';
import seguradoraService from '@services/seguradora.service';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/api\/?$/, '');
const getLogoUrl = (path) => path ? (path.startsWith('http') ? path : `${apiBase}/storage/${path}`) : null;

const STATUS_MAP = {
    pendente:  { color: 'processing', label: 'Pendente',  icon: <ClockCircleOutlined /> },
    aprovada:  { color: 'success',    label: 'Aprovada',  icon: <CheckCircleOutlined /> },
    rejeitada: { color: 'error',      label: 'Rejeitada', icon: <CloseCircleOutlined /> },
    suspensa:  { color: 'default',    label: 'Suspensa',  icon: <StopOutlined /> },
};

const ParceiriasPage = () => {
    const [parceiras, setParceiras]         = useState([]);
    const [loading, setLoading]             = useState(false);
    const [activeTab, setActiveTab]         = useState('pendentes');
    const [aprovarModal, setAprovarModal]   = useState({ open: false, parceria: null });
    const [rejeitarModal, setRejeitarModal] = useState({ open: false, parceria: null });
    const [revogarModal, setRevogarModal]   = useState({ open: false, parceria: null });
    const [segurosModal, setSegurosModal]   = useState({ open: false, parceria: null, seguros: [], loading: false });
    const [actionLoading, setActionLoading] = useState(false);
    const [aprovarForm] = Form.useForm();
    const [rejeitarForm] = Form.useForm();

    const fetchParceiras = async () => {
        setLoading(true);
        try {
            const data = await seguradoraService.getParceiras();
            setParceiras(data);
        } catch {
            message.error('Erro ao carregar parcerias.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchParceiras(); }, []);

    const handleAprovar = async () => {
        const values = await aprovarForm.validateFields();
        setActionLoading(true);
        try {
            await seguradoraService.aprovarParceria(aprovarModal.parceria.id, values.comissao_percentagem);
            message.success('Parceria aprovada! Os seguros foram desbloqueados para a corretora.');
            setAprovarModal({ open: false, parceria: null });
            aprovarForm.resetFields();
            fetchParceiras();
        } catch (err) {
            message.error(err?.message || 'Erro ao aprovar parceria.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejeitar = async () => {
        const values = await rejeitarForm.validateFields();
        setActionLoading(true);
        try {
            await seguradoraService.rejeitarParceria(rejeitarModal.parceria.id, values.observacoes);
            message.success('Solicitação rejeitada.');
            setRejeitarModal({ open: false, parceria: null });
            rejeitarForm.resetFields();
            fetchParceiras();
        } catch (err) {
            message.error(err?.message || 'Erro ao rejeitar parceria.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerSeguros = async (parceria) => {
        setSegurosModal({ open: true, parceria, seguros: [], loading: true });
        try {
            const data = await seguradoraService.getParceiriaSeguros(parceria.id);
            setSegurosModal(prev => ({ ...prev, seguros: data, loading: false }));
        } catch {
            message.error('Erro ao carregar seguros autorizados.');
            setSegurosModal(prev => ({ ...prev, loading: false }));
        }
    };

    const handleRevogar = async () => {
        setActionLoading(true);
        try {
            await seguradoraService.revogarParceria(revogarModal.parceria.id);
            message.success('Parceria revogada. Os seguros foram bloqueados para a corretora.');
            setRevogarModal({ open: false, parceria: null });
            fetchParceiras();
        } catch (err) {
            message.error(err?.message || 'Erro ao revogar parceria.');
        } finally {
            setActionLoading(false);
        }
    };

    const pendentes  = parceiras.filter(p => p.status === 'pendente');
    const aprovadas  = parceiras.filter(p => p.status === 'aprovada');
    const rejeitadas = parceiras.filter(p => ['rejeitada', 'suspensa'].includes(p.status));

    const ParceriaCard = ({ p }) => {
        const st = STATUS_MAP[p.status] || STATUS_MAP.pendente;
        const bgMap   = { pendente: '#eff6ff', aprovada: '#f0fdf4', rejeitada: '#fff5f5', suspensa: '#f8fafc' };
        const bdrMap  = { pendente: '#bfdbfe', aprovada: '#bbf7d0', rejeitada: '#fecaca', suspensa: '#e2e8f0' };

        return (
            <div style={{
                borderRadius: '20px',
                border: `1.5px solid ${bdrMap[p.status] || '#e2e8f0'}`,
                background: bgMap[p.status] || '#fff',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <Avatar
                            size={48}
                            src={getLogoUrl(p.corretora?.logo)}
                            icon={<BankOutlined />}
                            style={{ background: '#e2e8f0', flexShrink: 0 }}
                        />
                        <div>
                            <Text strong style={{ fontSize: '15px', display: 'block', color: '#0f172a' }}>
                                {p.corretora?.nome}
                            </Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>{p.corretora?.email}</Text>
                        </div>
                    </div>
                    <Tag icon={st.icon} color={st.color} style={{ borderRadius: '20px', fontWeight: 600 }}>
                        {st.label}
                    </Tag>
                </div>

                {p.status === 'aprovada' && (
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ background: '#fff', borderRadius: '10px', padding: '8px 14px', border: '1px solid #e2e8f0' }}>
                            <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>Comissão</Text>
                            <Text strong style={{ color: '#16a34a', fontSize: '14px' }}>
                                {parseFloat(p.comissao_percentagem || 0).toFixed(1)}%
                            </Text>
                        </div>
                        <Tooltip title="Clique para ver a lista de seguros autorizados">
                            <div
                                onClick={() => handleVerSeguros(p)}
                                style={{
                                    background: '#eff6ff', borderRadius: '10px', padding: '8px 14px',
                                    border: '1px solid #bfdbfe', cursor: 'pointer',
                                    display: 'flex', flexDirection: 'column',
                                    transition: 'box-shadow 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(37,99,235,0.15)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                            >
                                <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>Seguros autorizados</Text>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Text strong style={{ fontSize: '14px', color: '#2563eb' }}>
                                        {p.seguros_autorizados ?? '—'}
                                    </Text>
                                    <EyeOutlined style={{ fontSize: '12px', color: '#2563eb' }} />
                                </div>
                            </div>
                        </Tooltip>
                        <div style={{ background: '#fff', borderRadius: '10px', padding: '8px 14px', border: '1px solid #e2e8f0' }}>
                            <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>Aprovada em</Text>
                            <Text strong style={{ fontSize: '13px' }}>
                                {p.data_aprovacao ? new Date(p.data_aprovacao).toLocaleDateString('pt-MZ') : '—'}
                            </Text>
                        </div>
                    </div>
                )}

                {(p.status === 'rejeitada' || p.status === 'suspensa') && p.observacoes && (
                    <div style={{ background: '#fff5f5', borderRadius: '10px', padding: '10px 14px', border: '1px solid #fecaca' }}>
                        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>Observações</Text>
                        <Text style={{ fontSize: '13px', color: '#dc2626' }}>{p.observacoes}</Text>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                    {p.status === 'pendente' && (
                        <>
                            <Button
                                size="small"
                                type="primary"
                                icon={<CheckOutlined />}
                                onClick={() => { aprovarForm.resetFields(); setAprovarModal({ open: true, parceria: p }); }}
                                style={{ borderRadius: '8px', background: '#16a34a', borderColor: '#16a34a' }}
                            >
                                Aprovar
                            </Button>
                            <Button
                                size="small"
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => { rejeitarForm.resetFields(); setRejeitarModal({ open: true, parceria: p }); }}
                                style={{ borderRadius: '8px' }}
                            >
                                Rejeitar
                            </Button>
                        </>
                    )}
                    {p.status === 'aprovada' && (
                        <Button
                            size="small"
                            danger
                            icon={<StopOutlined />}
                            onClick={() => setRevogarModal({ open: true, parceria: p })}
                            style={{ borderRadius: '8px' }}
                        >
                            Revogar Parceria
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    const tabItems = [
        {
            key: 'pendentes',
            label: (
                <span>
                    Pendentes
                    {pendentes.length > 0 && (
                        <Badge count={pendentes.length} style={{ marginLeft: 8, background: '#2563eb' }} />
                    )}
                </span>
            ),
            children: loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
            ) : pendentes.length === 0 ? (
                <Empty description="Nenhuma solicitação pendente" style={{ padding: '60px 0' }} />
            ) : (
                <Row gutter={[16, 16]}>
                    {pendentes.map(p => (
                        <Col xs={24} md={12} xl={8} key={p.id}><ParceriaCard p={p} /></Col>
                    ))}
                </Row>
            ),
        },
        {
            key: 'aprovadas',
            label: (
                <span>
                    Ativas
                    {aprovadas.length > 0 && (
                        <Badge count={aprovadas.length} style={{ marginLeft: 8, background: '#16a34a' }} />
                    )}
                </span>
            ),
            children: loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
            ) : aprovadas.length === 0 ? (
                <Empty description="Nenhuma parceria ativa" style={{ padding: '60px 0' }} />
            ) : (
                <Row gutter={[16, 16]}>
                    {aprovadas.map(p => (
                        <Col xs={24} md={12} xl={8} key={p.id}><ParceriaCard p={p} /></Col>
                    ))}
                </Row>
            ),
        },
        {
            key: 'rejeitadas',
            label: 'Rejeitadas / Suspensas',
            children: loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
            ) : rejeitadas.length === 0 ? (
                <Empty description="Nenhum registo" style={{ padding: '60px 0' }} />
            ) : (
                <Row gutter={[16, 16]}>
                    {rejeitadas.map(p => (
                        <Col xs={24} md={12} xl={8} key={p.id}><ParceriaCard p={p} /></Col>
                    ))}
                </Row>
            ),
        },
    ];

    return (
        <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <Title level={2} style={{ fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
                        Parcerias com Corretoras
                    </Title>
                    <Text type="secondary">Gerencie solicitações de parceria e autorize corretoras a vender os seus seguros</Text>
                </div>
                <Button icon={<ReloadOutlined />} onClick={fetchParceiras} loading={loading}>
                    Atualizar
                </Button>
            </div>

            {/* Stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: '28px' }}>
                {[
                    { label: 'Parcerias Ativas',   value: aprovadas.length,  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
                    { label: 'Aguardando Decisão', value: pendentes.length,  color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
                    { label: 'Rejeitadas/Suspensas', value: rejeitadas.length, color: '#dc2626', bg: '#fff5f5', border: '#fecaca' },
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
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    style={{ padding: '0 24px' }}
                    tabBarStyle={{ borderBottom: '1px solid #f1f5f9', paddingTop: '8px' }}
                />
            </div>

            {/* Modal Aprovar */}
            <Modal
                open={aprovarModal.open}
                onCancel={() => { setAprovarModal({ open: false, parceria: null }); aprovarForm.resetFields(); }}
                onOk={handleAprovar}
                okText="Confirmar Aprovação"
                cancelText="Cancelar"
                confirmLoading={actionLoading}
                okButtonProps={{ style: { borderRadius: '10px', fontWeight: 700, background: '#16a34a', borderColor: '#16a34a' } }}
                cancelButtonProps={{ style: { borderRadius: '10px' } }}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CheckCircleOutlined style={{ color: '#16a34a' }} />
                        <span>Aprovar Parceria</span>
                    </div>
                }
            >
                <div style={{ padding: '8px 0' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#f0fdf4', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
                        <Avatar
                            size={44}
                            src={getLogoUrl(aprovarModal.parceria?.corretora?.logo)}
                            icon={<BankOutlined />}
                            style={{ background: '#e2e8f0' }}
                        />
                        <div>
                            <Text strong style={{ fontSize: '15px', display: 'block' }}>{aprovarModal.parceria?.corretora?.nome}</Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>{aprovarModal.parceria?.corretora?.email}</Text>
                        </div>
                    </div>

                    <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '10px 14px', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <SafetyCertificateOutlined style={{ color: '#2563eb', marginTop: '2px' }} />
                        <Text style={{ fontSize: '13px', color: '#1d4ed8' }}>
                            Ao aprovar, todos os seguros ativos da sua seguradora serão automaticamente autorizados para esta corretora.
                        </Text>
                    </div>

                    <Form form={aprovarForm} layout="vertical">
                        <Form.Item
                            label="Comissão (%)"
                            name="comissao_percentagem"
                            rules={[{ required: true, message: 'Defina a percentagem de comissão' }]}
                        >
                            <InputNumber
                                min={0}
                                max={100}
                                step={0.5}
                                precision={1}
                                addonAfter="%"
                                style={{ width: '100%' }}
                                placeholder="Ex: 5.0"
                            />
                        </Form.Item>
                    </Form>
                </div>
            </Modal>

            {/* Modal Rejeitar */}
            <Modal
                open={rejeitarModal.open}
                onCancel={() => { setRejeitarModal({ open: false, parceria: null }); rejeitarForm.resetFields(); }}
                onOk={handleRejeitar}
                okText="Confirmar Rejeição"
                cancelText="Cancelar"
                confirmLoading={actionLoading}
                okButtonProps={{ style: { borderRadius: '10px', fontWeight: 700 }, danger: true }}
                cancelButtonProps={{ style: { borderRadius: '10px' } }}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CloseCircleOutlined style={{ color: '#dc2626' }} />
                        <span>Rejeitar Solicitação</span>
                    </div>
                }
            >
                <div style={{ padding: '8px 0' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#f8fafc', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
                        <Avatar
                            size={44}
                            src={getLogoUrl(rejeitarModal.parceria?.corretora?.logo)}
                            icon={<BankOutlined />}
                            style={{ background: '#e2e8f0' }}
                        />
                        <div>
                            <Text strong style={{ fontSize: '15px', display: 'block' }}>{rejeitarModal.parceria?.corretora?.nome}</Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>{rejeitarModal.parceria?.corretora?.email}</Text>
                        </div>
                    </div>
                    <Form form={rejeitarForm} layout="vertical">
                        <Form.Item
                            label="Motivo / Observações"
                            name="observacoes"
                        >
                            <TextArea rows={3} placeholder="Opcional — descreva o motivo da rejeição" style={{ borderRadius: '10px' }} />
                        </Form.Item>
                    </Form>
                </div>
            </Modal>

            {/* Modal Seguros Autorizados */}
            <Modal
                open={segurosModal.open}
                onCancel={() => setSegurosModal({ open: false, parceria: null, seguros: [], loading: false })}
                footer={null}
                width={520}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileProtectOutlined style={{ color: '#2563eb' }} />
                        <span>Seguros autorizados — {segurosModal.parceria?.corretora?.nome}</span>
                    </div>
                }
            >
                {segurosModal.loading ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin /></div>
                ) : segurosModal.seguros.length === 0 ? (
                    <Empty description="Nenhum seguro autorizado" style={{ padding: '32px 0' }} />
                ) : (
                    <List
                        dataSource={segurosModal.seguros}
                        renderItem={s => (
                            <List.Item style={{ padding: '12px 0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: '10px',
                                            background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <FileProtectOutlined style={{ color: '#2563eb', fontSize: '16px' }} />
                                        </div>
                                        <div>
                                            <Text strong style={{ fontSize: '14px', display: 'block' }}>{s.nome}</Text>
                                            {s.descricao && (
                                                <Text type="secondary" style={{ fontSize: '12px' }}>{s.descricao}</Text>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                        <Tag
                                            color={s.status ? 'success' : 'default'}
                                            style={{ borderRadius: '20px', margin: 0 }}
                                        >
                                            {s.status ? 'Ativo' : 'Inativo'}
                                        </Tag>
                                        {s.premio_minimo && (
                                            <Text type="secondary" style={{ fontSize: '11px' }}>
                                                Prémio mín. {parseFloat(s.premio_minimo).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                                            </Text>
                                        )}
                                    </div>
                                </div>
                            </List.Item>
                        )}
                        style={{ maxHeight: '420px', overflowY: 'auto' }}
                    />
                )}
            </Modal>

            {/* Modal Revogar */}
            <Modal
                open={revogarModal.open}
                onCancel={() => setRevogarModal({ open: false, parceria: null })}
                onOk={handleRevogar}
                okText="Confirmar Revogação"
                cancelText="Cancelar"
                confirmLoading={actionLoading}
                okButtonProps={{ style: { borderRadius: '10px', fontWeight: 700 }, danger: true }}
                cancelButtonProps={{ style: { borderRadius: '10px' } }}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <StopOutlined style={{ color: '#dc2626' }} />
                        <span>Revogar Parceria</span>
                    </div>
                }
            >
                <div style={{ padding: '8px 0' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#fff5f5', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px' }}>
                        <Avatar
                            size={44}
                            src={getLogoUrl(revogarModal.parceria?.corretora?.logo)}
                            icon={<BankOutlined />}
                            style={{ background: '#e2e8f0' }}
                        />
                        <div>
                            <Text strong style={{ fontSize: '15px', display: 'block' }}>{revogarModal.parceria?.corretora?.nome}</Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>{revogarModal.parceria?.corretora?.email}</Text>
                        </div>
                    </div>
                    <Paragraph type="secondary" style={{ fontSize: '14px' }}>
                        A parceria será suspensa e todos os seguros autorizados para esta corretora serão <strong>bloqueados imediatamente</strong>. Esta ação pode ser revertida se a corretora solicitar novamente.
                    </Paragraph>
                </div>
            </Modal>
        </div>
    );
};

export default ParceiriasPage;
