import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Typography, message, Space, Button, Input } from 'antd';
import {
    FileProtectOutlined,
    SearchOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import ClienteLayout from '../Components/layouts/ClienteLayout';
import clienteService from '../../../services/cliente.service';

const { Title, Text } = Typography;

import { useNavigate } from 'react-router-dom';

const MinhasApolices = () => {
    const [apolices, setApolices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchApolices();
    }, []);

    const fetchApolices = async () => {
        setLoading(true);
        try {
            const data = await clienteService.getActivePolicies();
            // Dependendo de como o backend retorna (paginado ou array direto)
            setApolices(data.data || data || []);
        } catch (error) {
            console.error('Erro ao buscar apólices:', error);
            message.error('Não foi possível carregar suas apólices.');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Nº Apólice',
            dataIndex: 'numero_apolice',
            key: 'numero_apolice',
            render: (text) => <Text strong className="font-mono text-blue-600">{text || 'PENDENTE'}</Text>,
        },
        {
            title: 'Seguro',
            key: 'seguro',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{record.seguradora_seguro?.seguro?.nome}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.seguradora_seguro?.seguradora?.nome}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Bem Segurado',
            key: 'bem',
            render: (_, record) => {
                const bem = record.bemSegurado || record.bem_segurado;
                if (!bem) return 'N/A';
                return (
                    <Space direction="vertical" size={0}>
                        <Text>{bem.marca ? `${bem.marca} ${bem.modelo}` : bem.descricao}</Text>
                        <Tag color="cyan" style={{ fontSize: '10px' }}>
                            {record.bem_segurado_type?.split('\\').pop()}
                        </Tag>
                    </Space>
                );
            }
        },
        {
            title: 'Prêmio Total',
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
                else if (status === 'cancelada') { color = 'error'; icon = <ExclamationCircleOutlined />; }

                return <Tag icon={icon} color={color}>{status?.toUpperCase().replace('_', ' ')}</Tag>;
            }
        },
        {
            title: 'Validade',
            key: 'validade',
            render: (_, record) => (
                <div style={{ fontSize: '12px' }}>
                    <Text type="secondary">Início: {record.data_inicio_vigencia ? new Date(record.data_inicio_vigencia).toLocaleDateString() : '-'}</Text><br />
                    <Text type="secondary">Fim: {record.data_fim_vigencia ? new Date(record.data_fim_vigencia).toLocaleDateString() : '-'}</Text>
                </div>
            ),
        },
        {
            title: 'Ações',
            key: 'action',
            render: (_, record) => {
                // Determine ID based on whether it is a veiculo or propriedade policy
                // Adjust this logic if the ID field name is consistent or varies
                const id = record.id_apolice || record.id;
                return (
                    <Button
                        type="link"
                        size="small"
                        onClick={() => navigate(`/cliente/apolices/${id}`)}
                    >
                        Ver Detalhes
                    </Button>
                );
            },
        },
    ];

    return (
        <ClienteLayout>
            <div style={{ padding: '0 0 24px 0' }}>
                <Title level={2}>Minhas Apólices</Title>
                <Text type="secondary">Gerencie suas proteções e acompanhe a vigência de seus seguros.</Text>
            </div>

            <Card bordered={false} className="shadow-sm">
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <Input
                        placeholder="Buscar por número ou seguro..."
                        prefix={<SearchOutlined />}
                        style={{ width: 300 }}
                        onChange={e => setSearchText(e.target.value)}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={apolices.filter(item =>
                        item.numero_apolice?.toLowerCase().includes(searchText.toLowerCase()) ||
                        item.seguradora_seguro?.seguro?.nome?.toLowerCase().includes(searchText.toLowerCase())
                    )}
                    rowKey="id_apolice"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 'max-content' }}
                />
            </Card>
        </ClienteLayout>
    );
};

export default MinhasApolices;
