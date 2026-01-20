import React, { useEffect, useState } from 'react';
import { Table, Tag, Card, Typography, Button, Space, message, Modal } from 'antd';
import {
    FileTextOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    CloseCircleOutlined,
    CreditCardOutlined
} from '@ant-design/icons';
import clienteService from '../../../services/cliente.service';
import ClienteLayout from '../Components/layouts/ClienteLayout';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const MinhasPropostasPage = () => {
    const [propostas, setPropostas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const navigate = useNavigate();

    const fetchPropostas = async () => {
        try {
            setLoading(true);
            const response = await clienteService.getMinhasPropostas();
            setPropostas(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error(error);
            message.error('Erro ao carregar propostas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPropostas();
    }, []);

    const getStatusTag = (status, apolice = null) => {
        if (status === 'aprovada' && apolice?.status === 'pendente_aprovacao') {
            return <Tag icon={<CreditCardOutlined />} color="orange">AGUARDANDO PAGAMENTO</Tag>;
        }

        switch (status) {
            case 'em_analise':
                return <Tag icon={<SyncOutlined spin />} color="processing">EM ANÁLISE</Tag>;
            case 'aprovada':
                return <Tag icon={<CheckCircleOutlined />} color="success">APROVADA</Tag>;
            case 'rejeitada':
                return <Tag icon={<CloseCircleOutlined />} color="error">REJEITADA</Tag>;
            case 'rascunho':
                return <Tag color="default">RASCUNHO</Tag>;
            case 'convertida':
                return <Tag color="purple">CONVERTIDA EM APÓLICE</Tag>;
            default:
                return <Tag color="default">{status.toUpperCase()}</Tag>;
        }
    };

    const handlePagar = (record) => {
        const pagamento = record.apolice?.pagamentos?.[0];
        if (!pagamento) {
            message.error('Ordem de pagamento não encontrada.');
            return;
        }

        Modal.confirm({
            title: 'Confirmar Pagamento',
            content: (
                <div>
                    <p>Deseja simular o pagamento para ativar o seu seguro?</p>
                    <p><strong>Número do Pagamento:</strong> {pagamento.numero_pagamento}</p>
                    <p><strong>Valor:</strong> {parseFloat(pagamento.valor_parcela).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</p>
                </div>
            ),
            okText: 'Pagar Agora',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    setActionLoading(true);
                    await clienteService.confirmarPagamento(pagamento.id_pagamento);
                    message.success('Pagamento realizado com sucesso! O seu seguro está agora ativo.');
                    fetchPropostas();
                } catch (error) {
                    message.error('Erro ao processar pagamento.');
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    const columns = [
        {
            title: 'Número',
            dataIndex: 'numero_proposta',
            key: 'numero_proposta',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Seguro',
            key: 'seguro',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{record.seguradora_seguro?.seguro?.nome}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{record.seguradora_seguro?.seguradora?.nome}</Text>
                </Space>
            ),
        },
        {
            title: 'Bem Segurado',
            key: 'bem',
            render: (_, record) => {
                if (record.tipo_proposta === 'veiculo' && record.bem) {
                    return (
                        <Space direction="vertical" size={0}>
                            <Text>{record.bem.marca} {record.bem.modelo}</Text>
                            <Tag>{record.bem.matricula}</Tag>
                        </Space>
                    );
                } else if (record.tipo_proposta === 'propriedade' && record.bem) {
                    return <Text>{record.bem.descricao}</Text>;
                }
                return <Text type="secondary">Não identificado</Text>;
            }
        },
        {
            title: 'Prêmio Final',
            dataIndex: 'premio_calculado',
            key: 'premio',
            render: (value) => (
                <Text strong style={{ color: '#1890ff' }}>
                    {parseFloat(value).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                </Text>
            ),
        },
        {
            title: 'Data',
            dataIndex: 'created_at',
            key: 'data',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => getStatusTag(record.status, record.apolice),
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => {
                            Modal.info({
                                title: `Detalhes da Proposta #${record.numero_proposta}`,
                                width: 600,
                                content: (
                                    <div>
                                        <p><strong>Seguro:</strong> {record.seguradora_seguro?.seguro?.nome}</p>
                                        <p><strong>Status:</strong> {getStatusTag(record.status, record.apolice)}</p>
                                        <p><strong>Valor do Bem:</strong> {parseFloat(record.valor_bem).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</p>
                                        <p><strong>Coberturas:</strong></p>
                                        <ul>
                                            {record.coberturas_selecionadas?.map((c, i) => (
                                                <li key={i}>{c.descricao} - {c.valor_cobertura ? `Cobertura: ${c.valor_cobertura}` : ''} (Franquia: {c.franquia}%)</li>
                                            ))}
                                        </ul>
                                        {record.status === 'rejeitada' && (
                                            <div style={{ marginTop: 16, padding: 12, background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: 4 }}>
                                                <Text type="danger"><strong>Motivo da Rejeição:</strong> {record.motivo_rejeicao}</Text>
                                            </div>
                                        )}
                                        {record.status === 'aprovada' && record.apolice?.status === 'pendente_aprovacao' && (
                                            <div style={{ marginTop: 16, padding: 12, background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 4 }}>
                                                <Text type="warning"><strong>Pagamento Pendente:</strong> A sua proposta foi aprovada. Por favor, realize o pagamento para ativar o seu seguro.</Text>
                                            </div>
                                        )}
                                    </div>
                                )
                            });
                        }}
                    >
                        Detalhes
                    </Button>
                    {record.status === 'aprovada' && record.apolice?.status === 'pendente_aprovacao' && (
                        <Button
                            type="primary"
                            icon={<CreditCardOutlined />}
                            onClick={() => handlePagar(record)}
                            loading={actionLoading}
                            style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
                        >
                            Pagar
                        </Button>
                    )}
                    {record.apolice?.status === 'ativa' && (
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={() => navigate(`/cliente/apolices/${record.apolice.id_apolice}`)}
                        >
                            Ver Apólice
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <ClienteLayout>
            <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Title level={2}><FileTextOutlined /> Minhas Propostas</Title>
                    <Button type="primary" onClick={() => navigate('/cliente/contratar')}>Nova Simulação</Button>
                </div>

                <Card>
                    <Table
                        columns={columns}
                        dataSource={propostas}
                        rowKey="id_proposta"
                        scroll={{ x: 'max-content' }}
                        loading={loading}
                        locale={{ emptyText: 'Nenhuma proposta encontrada.' }}
                    />
                </Card>
            </div>
        </ClienteLayout>
    );
};

export default MinhasPropostasPage;
