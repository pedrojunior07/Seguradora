import React, { useState, useEffect } from 'react';
import {
    Table, Card, Button, Input, Tag, Space,
    message, Typography, Alert
} from 'antd';
import {
    SearchOutlined, FileTextOutlined,
    CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import api from '../../../services/api';
import moment from 'moment';

const { Title, Text } = Typography;

const ListaApolices = () => {
    const [apolices, setApolices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('pendentes'); // 'pendentes' or 'ativas'

    useEffect(() => {
        fetchApolices();
    }, [activeTab]);

    const fetchApolices = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            if (activeTab === 'pendentes') endpoint = '/seguradora/apolices/pendentes';
            else if (activeTab === 'ativas') endpoint = '/seguradora/apolices/ativas';
            else if (activeTab === 'diretas') endpoint = '/seguradora/contratacoes-diretas';

            const response = await api.get(endpoint);
            setApolices(response.data.data || []);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            message.error('Falha ao carregar lista');
        } finally {
            setLoading(false);
        }
    };

    const handleDecidir = async (id, tipo_bem, decisao) => {
        try {
            await api.post(`/seguradora/contratacoes-diretas/${id}/decidir`, {
                tipo_bem,
                decisao
            });
            message.success(`Proposta ${decisao === 'aprovar' ? 'aprovada' : 'rejeitada'} com sucesso!`);
            fetchApolices();
        } catch (error) {
            console.error('Erro ao decidir:', error);
            message.error(error.response?.data?.message || 'Erro ao processar decisão');
        }
    };

    const columns = [
        {
            title: activeTab === 'diretas' ? 'Cód. Contratação' : 'Nº Apólice',
            dataIndex: activeTab === 'diretas' ? 'id' : 'numero_apolice',
            key: 'identificador',
            render: (text) => <span className="font-mono font-bold text-blue-600">{text || 'N/A'}</span>,
        },
        {
            title: 'Seguro',
            render: (_, record) => record.seguradora_seguro?.seguro?.nome || 'N/A',
            key: 'seguro',
        },
        {
            title: 'Cliente',
            dataIndex: activeTab === 'diretas' ? 'cliente_nome' : ['cliente', 'nome'],
            key: 'cliente',
        },
        {
            title: activeTab === 'diretas' ? 'Bem Segurado' : 'Bem',
            dataIndex: activeTab === 'diretas' ? 'identificacao_bem' : 'bem_segurado_id', // Ajustar se necessário
            key: 'bem',
            render: (val, record) => activeTab === 'diretas' ? (
                <Space direction="vertical" size={0}>
                    <Text strong size="small">{val}</Text>
                    <Tag size="small" color={record.tipo_bem === 'veiculo' ? 'blue' : 'orange'}>
                        {record.tipo_bem?.toUpperCase()}
                    </Tag>
                </Space>
            ) : val
        },
        {
            title: 'Prêmio',
            dataIndex: activeTab === 'diretas' ? 'premio_final' : 'premio_total',
            key: 'premio',
            render: (val) => val ? `${parseFloat(val).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}` : '-',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                let icon = null;
                if (status === 'ativa' || status === 'ativo') { color = 'success'; icon = <CheckCircleOutlined />; }
                else if (status === 'pendente_aprovacao' || status === 'pendente' || status === 'proposta' || status === 'em_analise') { color = 'warning'; icon = <ClockCircleOutlined />; }
                else if (status === 'cancelada' || status === 'cancelado' || status === 'rejeitado') { color = 'error'; icon = <CloseCircleOutlined />; }

                return <Tag icon={icon} color={color}>{status?.toUpperCase().replace('_', ' ')}</Tag>;
            }
        },
        {
            title: 'Data',
            key: 'data',
            render: (_, record) => (
                <span className="text-xs text-gray-500">
                    {record.created_at ? new Date(record.created_at).toLocaleDateString() : '-'}
                </span>
            ),
        },
        {
            title: 'Auditoria / Última Ação',
            key: 'audit',
            render: (_, record) => {
                const audit = record.latest_audit_log;
                if (!audit) return <Text type="secondary" style={{ fontSize: '11px' }}>Sem logs</Text>;

                return (
                    <Space direction="vertical" size={0}>
                        <Space size={4}>
                            <Text strong style={{ fontSize: '11px' }}>{audit.user?.name || 'Sistema'}</Text>
                            <Tag color="blue" style={{ fontSize: '9px', padding: '0 4px', lineHeight: '14px' }}>
                                {audit.action.toUpperCase()}
                            </Tag>
                        </Space>
                        <Text type="secondary" style={{ fontSize: '10px' }}>
                            {moment(audit.created_at).format('DD/MM/YYYY HH:mm')}
                        </Text>
                    </Space>
                );
            }
        },
        {
            title: 'Ações',
            key: 'acoes',
            render: (_, record) => {
                if (activeTab === 'diretas' && (record.status === 'em_analise' || record.status === 'proposta')) {
                    return (
                        <Space>
                            <Button
                                size="small"
                                type="primary"
                                ghost
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleDecidir(record.id, record.tipo_bem, 'aprovar')}
                            >
                                Aprovar
                            </Button>
                            <Button
                                size="small"
                                danger
                                ghost
                                icon={<CloseCircleOutlined />}
                                onClick={() => handleDecidir(record.id, record.tipo_bem, 'rejeitar')}
                            >
                                Rejeitar
                            </Button>
                        </Space>
                    );
                }
                return null;
            }
        }
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Title level={2} style={{ margin: 0 }}>Gestão de Propostas e Apólices</Title>
                    <p className="text-gray-500">Analise propostas e gerencie apólices ativas</p>
                </div>
                <Button
                    type="primary"
                    icon={<FileTextOutlined />}
                    size="large"
                    style={{ background: '#10b981', borderColor: '#10b981' }}
                    onClick={() => message.info('Funcionalidade de Nova Proposta Manual em desenvolvimento')}
                >
                    Nova Proposta
                </Button>
            </div>

            <Alert
                message="Atenção Operador"
                description="Você tem permissão para visualizar todas as apólices, mas apenas Administradores podem aprovar propostas de alto risco."
                type="info"
                showIcon
                className="mb-4"
            />

            <Card bordered={false} className="shadow-sm rounded-lg"
                tabList={[
                    { key: 'pendentes', tab: 'Pendentes de Aprovação' },
                    { key: 'ativas', tab: 'Apólices Ativas' },
                    { key: 'diretas', tab: 'Contratações Diretas (Cliente)' },
                ]}
                activeTabKey={activeTab}
                onTabChange={key => setActiveTab(key)}
            >
                <Table
                    columns={columns}
                    dataSource={apolices}
                    rowKey={(record) => record.id_apolice || record.id}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default ListaApolices;
