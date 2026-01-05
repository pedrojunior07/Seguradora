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

const { Title } = Typography;

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
            const endpoint = activeTab === 'pendentes'
                ? '/seguradora/apolices/pendentes'
                : '/seguradora/apolices/ativas';

            const response = await api.get(endpoint);
            setApolices(response.data.data || []);
        } catch (error) {
            console.error('Erro ao buscar apólices:', error);
            message.error('Falha ao carregar lista de apólices');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Nº Apólice',
            dataIndex: 'numero_apolice',
            key: 'numero_apolice',
            render: (text) => <span className="font-mono font-bold text-blue-600">{text || 'N/A'}</span>,
        },
        {
            title: 'Seguro',
            dataIndex: ['seguradora_seguro', 'seguro', 'nome'],
            key: 'seguro',
        },
        {
            title: 'Cliente',
            dataIndex: ['cliente', 'nome'],
            key: 'cliente',
        },
        {
            title: 'Prêmio',
            dataIndex: 'premio_total',
            key: 'premio_total',
            render: (val) => val ? `${parseFloat(val).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}` : '-',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                let icon = null;
                if (status === 'ativa') { color = 'success'; icon = <CheckCircleOutlined />; }
                else if (status === 'pendente_aprovacao') { color = 'warning'; icon = <ClockCircleOutlined />; }
                else if (status === 'cancelada') { color = 'error'; icon = <CloseCircleOutlined />; }

                return <Tag icon={icon} color={color}>{status?.toUpperCase().replace('_', ' ')}</Tag>;
            }
        },
        {
            title: 'Vigência',
            key: 'vigencia',
            render: (_, record) => (
                <span className="text-xs text-gray-500">
                    {record.data_inicio} até {record.data_fim}
                </span>
            ),
        },
        {
            title: 'Ações',
            key: 'acoes',
            render: (_, record) => (
                <Button type="link" size="small">Ver Detalhes</Button>
            ),
        },
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
                ]}
                activeTabKey={activeTab}
                onTabChange={key => setActiveTab(key)}
            >
                <Table
                    columns={columns}
                    dataSource={apolices}
                    rowKey="id_apolice"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default ListaApolices;
