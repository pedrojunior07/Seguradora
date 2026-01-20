import React, { useEffect, useState } from 'react';
import { Table, Card, Tag, Button, Space, Typography, Tooltip, message, Select } from 'antd';
import {
    FileTextOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    SyncOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import seguradoraService from '../../../services/seguradora.service';

const { Title, Text } = Typography;
const { Option } = Select;

const ListaPropostasPage = () => {
    const [propostas, setPropostas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('em_analise');
    const navigate = useNavigate();

    const fetchPropostas = async () => {
        try {
            setLoading(true);
            const response = await seguradoraService.getPropostas({ status: statusFilter });
            setPropostas(response.data || []);
        } catch (error) {
            console.error(error);
            message.error('Erro ao carregar propostas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPropostas();
    }, [statusFilter]);

    const getStatusTag = (status) => {
        switch (status) {
            case 'em_analise': return <Tag icon={<SyncOutlined spin />} color="processing">EM ANÁLISE</Tag>;
            case 'aprovada': return <Tag icon={<CheckCircleOutlined />} color="success">APROVADA</Tag>;
            case 'rejeitada': return <Tag icon={<CloseCircleOutlined />} color="error">REJEITADA</Tag>;
            default: return <Tag>{status.toUpperCase()}</Tag>;
        }
    };

    const columns = [
        {
            title: 'Proposta',
            dataIndex: 'numero_proposta',
            key: 'numero_proposta',
            render: text => <Text strong>{text}</Text>
        },
        {
            title: 'Cliente',
            key: 'cliente',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text>{record.cliente?.nome}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{record.cliente?.email}</Text>
                </Space>
            )
        },
        {
            title: 'Seguro',
            key: 'seguro',
            render: (_, record) => record.seguradora_seguro?.seguro?.nome
        },
        {
            title: 'Bem',
            key: 'bem',
            render: (_, record) => {
                if (record.tipo_proposta === 'veiculo') {
                    return `${record.bem?.marca} ${record.bem?.modelo} (${record.bem?.matricula})`;
                }
                return record.bem?.descricao || 'Propriedade';
            }
        },
        {
            title: 'Prêmio',
            dataIndex: 'premio_calculado',
            key: 'premio',
            render: val => parseFloat(val).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })
        },
        {
            title: 'Data',
            dataIndex: 'created_at',
            key: 'data',
            render: val => new Date(val).toLocaleDateString()
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: status => getStatusTag(status)
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={() => navigate(`/seguradora/propostas/${record.id_proposta}`)}
                >
                    Avaliar
                </Button>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2}><FileTextOutlined /> Gestão de Propostas</Title>
                <Select
                    defaultValue="em_analise"
                    style={{ width: 200 }}
                    onChange={val => setStatusFilter(val)}
                >
                    <Option value="">Todas</Option>
                    <Option value="em_analise">Em Análise</Option>
                    <Option value="aprovada">Aprovadas</Option>
                    <Option value="rejeitada">Rejeitadas</Option>
                </Select>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={propostas}
                    loading={loading}
                    rowKey="id_proposta"
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default ListaPropostasPage;
