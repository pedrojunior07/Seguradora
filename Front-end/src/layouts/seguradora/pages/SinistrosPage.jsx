import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Card, Typography, Input, message, Tabs } from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../../../services/api';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const SinistrosPage = () => {
    const [loading, setLoading] = useState(false);
    const [sinistros, setSinistros] = useState([]);
    const [activeTab, setActiveTab] = useState('aberto');
    const navigate = useNavigate();

    useEffect(() => {
        fetchSinistros();
    }, [activeTab]);

    const fetchSinistros = async () => {
        setLoading(true);
        try {
            // Se for 'todos', usamos um endpoint diferente ou passamos parâmetro
            const url = activeTab === 'todos'
                ? '/seguradora/sinistros'
                : `/seguradora/sinistros/${activeTab}`;

            // Nota: O backend pode precisar destes endpoints específicos se não existirem
            // Seguindo os nomes do controlador analisado: pendentes, emAnalise
            let finalUrl = url;
            if (activeTab === 'aberto') finalUrl = '/seguradora/sinistros/pendentes';
            if (activeTab === 'em_analise') finalUrl = '/seguradora/sinistros/em-analise';

            const response = await api.get(finalUrl);
            const data = response.data?.data || response.data;
            setSinistros(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erro ao buscar sinistros:', error);
            // message.error('Erro ao carregar sinistros');
            setSinistros([]);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Nº Sinistro',
            dataIndex: 'numero_sinistro',
            key: 'numero_sinistro',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Cliente',
            dataIndex: ['apolice', 'cliente', 'nome'],
            key: 'cliente',
            render: (text, record) => text || record.cliente?.nome || 'N/A'
        },
        {
            title: 'Data Ocorrência',
            dataIndex: 'data_ocorrencia',
            key: 'data_ocorrencia',
            render: (date) => date ? moment(date).format('DD/MM/YYYY') : 'N/A'
        },
        {
            title: 'Seguro / Categoria',
            key: 'seguro_info',
            render: (_, record) => (
                <div>
                    <Text strong>{record.apolice?.seguradoraSeguro?.seguro?.nome || 'N/A'}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                        {record.apolice?.seguradoraSeguro?.seguro?.categoria?.nome} - {record.apolice?.seguradoraSeguro?.seguro?.tipo?.nome}
                    </Text>
                </div>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = {
                    aberto: 'blue',
                    em_analise: 'gold',
                    aprovado: 'green',
                    negado: 'red',
                    pago: 'purple'
                };
                return <Tag color={colors[status] || 'default'}>{status ? status.toUpperCase().replace('_', ' ') : 'N/A'}</Tag>;
            }
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
                            <Tag color="cyan" style={{ fontSize: '9px', padding: '0 4px', lineHeight: '14px' }}>
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
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => navigate(`/seguradora/sinistros/${record.id_sinistro}`)}
                    >
                        Analisar
                    </Button>
                </Space>
            )
        }
    ];

    const tabItems = [
        { key: 'aberto', label: 'Pendentes' },
        { key: 'em_analise', label: 'Em Análise' },
        { key: 'finalizado', label: 'Histórico' },
        { key: 'todos', label: 'Todos os Sinistros' },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <div style={{ marginBottom: '24px' }}>
                    <Title level={2}>Gestão de Sinistros</Title>
                    <Text type="secondary">Analise e processe as solicitações de indenização</Text>
                </div>

                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    style={{ marginBottom: '16px' }}
                />

                <Table
                    columns={columns}
                    dataSource={sinistros}
                    rowKey="id_sinistro"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default SinistrosPage;
