import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Tag, Space, Avatar, Modal, Descriptions, Empty } from 'antd';
import {
    HistoryOutlined,
    UserOutlined,
    ClockCircleOutlined,
    LaptopOutlined,
    ArrowRightOutlined,
    DiffOutlined,
} from '@ant-design/icons';
import api from '../../../services/api';
import moment from 'moment';

const { Title, Text } = Typography;

const ACTION_CONFIG = {
    aprovar:   { color: 'green',   label: 'Aprovou' },
    negar:     { color: 'red',     label: 'Negou' },
    rejeitar:  { color: 'red',     label: 'Rejeitou' },
    ativar:    { color: 'blue',    label: 'Ativou' },
    desativar: { color: 'orange',  label: 'Desativou' },
    analisar:  { color: 'gold',    label: 'Analisou' },
    criar:     { color: 'cyan',    label: 'Criou' },
    cancelar:  { color: 'volcano', label: 'Cancelou' },
};

const getModelName = (auditableType) => {
    if (!auditableType) return '—';
    const parts = auditableType.split('\\');
    return parts[parts.length - 1];
};

const AuditoriaPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 50, total: 0 });
    const [detailModal, setDetailModal] = useState({ visible: false, record: null });

    useEffect(() => {
        fetchLogs(pagination.current);
    }, [pagination.current]);

    const fetchLogs = async (page) => {
        setLoading(true);
        try {
            const response = await api.get('/seguradora/auditoria', { params: { page } });
            setLogs(response.data.data || []);
            setPagination(prev => ({ ...prev, total: response.data.total || 0 }));
        } catch (error) {
            console.error('Erro ao buscar logs:', error);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const renderChanges = (oldData, newData) => {
        if (!oldData && !newData) {
            return <Empty description="Sem detalhes de alteração" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
        }

        const keys = Array.from(new Set([
            ...Object.keys(oldData || {}),
            ...Object.keys(newData || {}),
        ]));

        const SKIP = ['updated_at', 'created_at', 'data_modificacao'];
        const changes = keys.filter(key => {
            if (SKIP.includes(key)) return false;
            return JSON.stringify(oldData?.[key]) !== JSON.stringify(newData?.[key]);
        });

        if (changes.length === 0) {
            return <Text type="secondary">Nenhuma alteração nos campos principais.</Text>;
        }

        return (
            <Descriptions title="Diferenças" bordered column={1} size="small">
                {changes.map(key => (
                    <Descriptions.Item label={<strong>{key}</strong>} key={key}>
                        <Space>
                            <Text delete type="secondary">{String(oldData?.[key] ?? 'nulo')}</Text>
                            <ArrowRightOutlined />
                            <Text strong style={{ color: '#059669' }}>{String(newData?.[key] ?? 'nulo')}</Text>
                        </Space>
                    </Descriptions.Item>
                ))}
            </Descriptions>
        );
    };

    const columns = [
        {
            title: 'Operador',
            dataIndex: 'user',
            key: 'user',
            render: (user) => (
                <Space size={8}>
                    <Avatar icon={<UserOutlined />} size="small" style={{ background: '#2563EB' }} />
                    <div>
                        <Text strong style={{ fontSize: 13 }}>{user?.name || 'Sistema'}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 11 }}>{user?.email || ''}</Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Ação',
            dataIndex: 'action',
            key: 'action',
            render: (action) => {
                if (!action) return <Text type="secondary">—</Text>;
                const cfg = ACTION_CONFIG[action] || { color: 'default', label: action };
                return <Tag color={cfg.color} style={{ fontWeight: 600, textTransform: 'capitalize' }}>{cfg.label}</Tag>;
            },
        },
        {
            title: 'Objeto',
            key: 'object',
            render: (_, record) => {
                const name = getModelName(record.auditable_type);
                return record.auditable_id
                    ? <Tag color="blue">{name} #{record.auditable_id}</Tag>
                    : <Text type="secondary">—</Text>;
            },
        },
        {
            title: 'Descrição',
            dataIndex: 'description',
            key: 'description',
            render: (text) => <Text style={{ fontSize: 13 }}>{text || '—'}</Text>,
        },
        {
            title: 'Alterações',
            key: 'history',
            render: (_, record) =>
                record.old_values || record.new_values ? (
                    <Tag
                        icon={<DiffOutlined />}
                        color="processing"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setDetailModal({ visible: true, record })}
                    >
                        Ver mudanças
                    </Tag>
                ) : (
                    <Text type="secondary">—</Text>
                ),
        },
        {
            title: 'Data e hora',
            dataIndex: 'created_at',
            key: 'date',
            render: (date) => (
                <Space size={6}>
                    <ClockCircleOutlined style={{ color: '#94a3b8', fontSize: 12 }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {date ? moment(date).format('DD/MM/YYYY HH:mm') : '—'}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'IP',
            dataIndex: 'ip_address',
            key: 'ip',
            render: (ip) => (
                <Space size={6}>
                    <LaptopOutlined style={{ color: '#94a3b8', fontSize: 12 }} />
                    <Text type="secondary" style={{ fontSize: 11 }}>{ip || '—'}</Text>
                </Space>
            ),
        },
    ];

    return (
        <>
        <div className="page-container">
            <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <HistoryOutlined /> Auditoria
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                    Registo de operações e alterações de estado
                </Text>
            </div>

            <Table
                columns={columns}
                dataSource={logs}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    onChange: (page) => setPagination(prev => ({ ...prev, current: page })),
                    showSizeChanger: false,
                    showTotal: (total) => `${total} registos`,
                }}
                size="small"
                scroll={{ x: 900 }}
            />
        </div>

            <Modal
                title={
                    <Space>
                        <HistoryOutlined />
                        <span>
                            Alteração —{' '}
                            {detailModal.record?.action
                                ? (ACTION_CONFIG[detailModal.record.action]?.label ?? detailModal.record.action)
                                : ''}
                        </span>
                    </Space>
                }
                open={detailModal.visible}
                onCancel={() => setDetailModal({ visible: false, record: null })}
                footer={null}
                width={700}
            >
                {detailModal.record && renderChanges(
                    detailModal.record.old_values,
                    detailModal.record.new_values,
                )}
            </Modal>
        </>
    );
};

export default AuditoriaPage;
