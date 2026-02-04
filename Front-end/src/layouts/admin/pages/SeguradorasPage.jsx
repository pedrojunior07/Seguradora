import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Typography, Card, message, Tooltip } from 'antd';
import { ReloadOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import AdminService from '@services/admin.service';

const { Title } = Typography;

const SeguradorasPage = () => {
    const [loading, setLoading] = useState(false);
    const [seguradoras, setSeguradoras] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const fetchSeguradoras = async (page = 1) => {
        setLoading(true);
        try {
            const data = await AdminService.getSeguradoras({ page });
            if (data && data.data) {
                setSeguradoras(data.data);
                setPagination({
                    current: data.current_page,
                    pageSize: data.per_page,
                    total: data.total,
                });
            } else {
                // Fallback caso a API retorne formato diferente
                setSeguradoras(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            message.error('Erro ao carregar seguradoras');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSeguradoras();
    }, []);

    const handleTableChange = (newPagination) => {
        fetchSeguradoras(newPagination.current);
    };

    const handleToggleStatus = async (record) => {
        try {
            await AdminService.toggleSeguradoraStatus(record.id_seguradora);
            message.success(`Seguradora ${record.status ? 'bloqueada' : 'ativada'} com sucesso`);
            fetchSeguradoras(pagination.current);
        } catch (error) {
            message.error('Erro ao alterar status da seguradora');
        }
    };

    const columns = [
        {
            title: 'Logo',
            dataIndex: 'logo',
            key: 'logo',
            render: (logo) => (
                logo ? <img src={logo} alt="Logo" style={{ width: 40, height: 40, objectFit: 'contain' }} /> : '-'
            ),
        },
        {
            title: 'Nome',
            dataIndex: 'nome',
            key: 'nome',
        },
        {
            title: 'Responsável',
            dataIndex: 'nome_responsavel',
            key: 'nome_responsavel',
            responsive: ['md'],
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'NUIT',
            dataIndex: 'nuit',
            key: 'nuit',
            responsive: ['lg'],
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status ? 'green' : 'red'}>
                    {status ? 'ATIVO' : 'BLOQUEADO'}
                </Tag>
            ),
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title={record.status ? "Bloquear Acesso" : "Desbloquear Acesso"}>
                        <Button
                            type={record.status ? 'primary' : 'default'}
                            danger={record.status}
                            icon={record.status ? <StopOutlined /> : <CheckCircleOutlined />}
                            onClick={() => handleToggleStatus(record)}
                        >
                            {record.status ? 'Bloquear' : 'Ativar'}
                        </Button>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2}>Gestão de Seguradoras</Title>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchSeguradoras(pagination.current)}
                >
                    Atualizar
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={seguradoras}
                    rowKey="id_seguradora"
                    pagination={pagination}
                    loading={loading}
                    onChange={handleTableChange}
                />
            </Card>
        </div>
    );
};

export default SeguradorasPage;
