import React, { useEffect, useState } from 'react';
import { Table, Tag, Card, Typography, Button, Space, message, Modal } from 'antd';
import {
    CreditCardOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    AlertOutlined,
    EyeOutlined
} from '@ant-design/icons';
import clienteService from '../../../services/cliente.service';
import ClienteLayout from '../Components/layouts/ClienteLayout';

const { Title, Text } = Typography;

const PagamentosPage = () => {
    const [pagamentos, setPagamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchPagamentos = async () => {
        try {
            setLoading(true);
            const response = await clienteService.getPendingPayments();
            // A API pode retornar em diferentes formatos, vamos tentar normalizar
            setPagamentos(Array.isArray(response) ? response : (response.data || []));
        } catch (error) {
            console.error(error);
            message.error('Erro ao carregar pagamentos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPagamentos();
    }, []);

    const getStatusTag = (status) => {
        switch (status) {
            case 'pendente':
                return <Tag icon={<SyncOutlined spin />} color="processing">PENDENTE</Tag>;
            case 'pago':
                return <Tag icon={<CheckCircleOutlined />} color="success">PAGO</Tag>;
            case 'atrasado':
                return <Tag icon={<AlertOutlined />} color="error">ATRASADO</Tag>;
            default:
                return <Tag color="default">{status?.toUpperCase()}</Tag>;
        }
    };

    const handleConfirmarPagamento = (pagamento) => {
        Modal.confirm({
            title: 'Confirmar Pagamento Fictício',
            content: (
                <div>
                    <p>Deseja simular o pagamento desta fatura para ativar o seguro correspondente?</p>
                    <p><strong>Número:</strong> {pagamento.numero_pagamento}</p>
                    <p><strong>Valor:</strong> {parseFloat(pagamento.valor_parcela).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</p>
                </div>
            ),
            okText: 'Simular Pagamento',
            onOk: async () => {
                try {
                    setActionLoading(true);
                    await clienteService.confirmarPagamento(pagamento.id_pagamento);
                    message.success('Pagamento confirmado com sucesso!');
                    fetchPagamentos();
                } catch (error) {
                    message.error('Erro ao confirmar pagamento.');
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    const columns = [
        {
            title: 'Número',
            dataIndex: 'numero_pagamento',
            key: 'numero_pagamento',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Apólice Relacionada',
            key: 'apolice',
            render: (_, record) => (
                <Text>{record.apolice?.numero_apolice || 'N/A'}</Text>
            ),
        },
        {
            title: 'Valor',
            dataIndex: 'valor_parcela',
            key: 'valor',
            render: (value) => (
                <Text strong>
                    {parseFloat(value).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                </Text>
            ),
        },
        {
            title: 'Vencimento',
            dataIndex: 'data_vencimento',
            key: 'vencimento',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    {record.status === 'pendente' && (
                        <Button
                            type="primary"
                            icon={<CreditCardOutlined />}
                            onClick={() => handleConfirmarPagamento(record)}
                            loading={actionLoading}
                            style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
                        >
                            Pagar
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <ClienteLayout>
            <div style={{ padding: 24 }}>
                <Title level={2}><CreditCardOutlined /> Meus Pagamentos</Title>
                <Card>
                    <Table
                        columns={columns}
                        dataSource={pagamentos}
                        rowKey="id_pagamento"
                        loading={loading}
                        scroll={{ x: 'max-content' }}
                        locale={{ emptyText: 'Nenhum pagamento pendente encontrado.' }}
                    />
                </Card>
            </div>
        </ClienteLayout>
    );
};

export default PagamentosPage;
