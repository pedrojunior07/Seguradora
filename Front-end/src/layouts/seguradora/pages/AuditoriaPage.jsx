import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Tag, Space, Avatar, Modal, Descriptions, Empty } from 'antd';
import { HistoryOutlined, UserOutlined, ClockCircleOutlined, LaptopOutlined, ArrowRightOutlined, DiffOutlined } from '@ant-design/icons';
import api from '../../../services/api';
import moment from 'moment';

const { Title, Text } = Typography;

const AuditoriaPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 50, total: 0 });
    const [detailModal, setDetailModal] = useState({ visible: false, record: null });

    useEffect(() => {
        fetchLogs();
    }, [pagination.current]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/seguradora/auditoria?page=${pagination.current}`);
            setLogs(response.data.data);
            setPagination({
                ...pagination,
                total: response.data.total
            });
        } catch (error) {
            console.error('Erro ao buscar logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionTag = (action) => {
        const actions = {
            aprovar: { color: 'green', label: 'APROVOU' },
            negar: { color: 'red', label: 'NEGOU' },
            rejeitar: { color: 'red', label: 'REJEITOU' },
            ativar: { color: 'blue', label: 'ATIVOU' },
            desativar: { color: 'orange', label: 'DESATIVOU' },
            analisar: { color: 'gold', label: 'ANALISOU' },
            criar: { color: 'cyan', label: 'CRIOU' },
            cancelar: { color: 'volcano', label: 'CANCELOU' },
        };
        const config = actions[action] || { color: 'default', label: action.toUpperCase() };
        return <Tag color={config.color} style={{ fontWeight: 'bold' }}>{config.label}</Tag>;
    };

    const renderChanges = (oldData, newData) => {
        if (!oldData && !newData) return <Empty description="Sem detalhes de alteração" image={Empty.PRESENTED_IMAGE_SIMPLE} />;

        const keys = Array.from(new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]));
        const changes = keys.filter(key => {
            const oldVal = oldData?.[key];
            const newVal = newData?.[key];
            // Ignorar campos de timestamp e outros irrelevantes se desejar
            if (['updated_at', 'created_at', 'data_modificacao'].includes(key)) return false;
            return JSON.stringify(oldVal) !== JSON.stringify(newVal);
        });

        if (changes.length === 0) return <Text type="secondary">Nenhuma alteração de valor detectada nos campos principais.</Text>;

        return (
            <Descriptions title="Diferenças Detectadas" bordered column={1} size="small">
                {changes.map(key => (
                    <Descriptions.Item label={<strong>{key.toUpperCase()}</strong>} key={key}>
                        <Space>
                            <Text delete type="secondary">{String(oldData?.[key] ?? 'nulo')}</Text>
                            <ArrowRightOutlined />
                            <Text strong type="success">{String(newData?.[key] ?? 'nulo')}</Text>
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
                <Space>
                    <Avatar icon={<UserOutlined />} size="small" />
                    <div>
                        <Text strong>{user?.name || 'Sistema'}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '11px' }}>{user?.email}</Text>
                    </div>
                </Space>
            )
        },
        {
            title: 'Ação',
            dataIndex: 'action',
            key: 'action',
            render: (action) => getActionTag(action)
        },
        {
            title: 'Objeto',
            key: 'object',
            render: (_, record) => {
                const parts = record.auditable_type.split('\\');
                const modelName = parts[parts.length - 1];
                return <Tag color="blue">{modelName} #{record.auditable_id}</Tag>;
            }
        },
        {
            title: 'Descrição',
            dataIndex: 'description',
            key: 'description',
            render: (text) => <Text style={{ fontSize: '13px' }}>{text || '-'}</Text>
        },
        {
            title: 'Histórico',
            key: 'history',
            render: (_, record) => (record.old_values || record.new_values) ? (
                <Tag
                    icon={<DiffOutlined />}
                    color="processing"
                    className="cursor-pointer"
                    onClick={() => setDetailModal({ visible: true, record })}
                >
                    Ver Mudanças
                </Tag>
            ) : <Text type="secondary">-</Text>
        },
        {
            title: 'Data e Hora',
            dataIndex: 'created_at',
            key: 'date',
            render: (date) => (
                <Space>
                    <ClockCircleOutlined style={{ color: '#bfbfbf' }} />
                    <Text type="secondary">{moment(date).format('DD/MM/YYYY HH:mm:ss')}</Text>
                </Space>
            )
        },
        {
            title: 'Terminal',
            dataIndex: 'ip_address',
            key: 'ip',
            render: (ip) => (
                <Space>
                    <LaptopOutlined style={{ color: '#bfbfbf' }} />
                    <Text type="secondary" style={{ fontSize: '11px' }}>{ip || 'N/A'}</Text>
                </Space>
            )
        }
    ];

    return (
        <div className="p-6">
            <Card bordered={false} className="shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <Title level={2} style={{ margin: 0 }}>
                            <HistoryOutlined /> Auditoria do Sistema
                        </Title>
                        <Text type="secondary">Rastreamento de operações e mudanças de estado nos registros</Text>
                    </div>
                </div>

                <Table
                    columns={columns}
                    dataSource={logs}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        onChange: (page) => setPagination({ ...pagination, current: page }),
                        showSizeChanger: false
                    }}
                    size="small"
                />
            </Card>

            <Modal
                title={
                    <Space>
                        <HistoryOutlined />
                        <span>Detalhes da Alteração - {detailModal.record?.action.toUpperCase()}</span>
                    </Space>
                }
                open={detailModal.visible}
                onCancel={() => setDetailModal({ visible: false, record: null })}
                footer={null}
                width={800}
            >
                {detailModal.record && renderChanges(detailModal.record.old_values, detailModal.record.new_values)}
            </Modal>
        </div>
    );
};

export default AuditoriaPage;
