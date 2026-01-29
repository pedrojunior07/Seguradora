import { useState, useEffect } from 'react';
import { Table, Tag, Typography, Button, Space, message, Popconfirm } from 'antd';
import { StopOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import AdminService from '../../../services/admin.service';

const { Title } = Typography;

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 15,
        total: 0
    });

    const fetchUsers = async (page = 1) => {
        setLoading(true);
        try {
            const response = await AdminService.getGovernanceUsers(page);
            setUsers(response.data);
            setPagination({
                current: response.current_page,
                pageSize: response.per_page,
                total: response.total
            });
        } catch (error) {
            console.error(error);
            message.error('Erro ao carregar usuários.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleStatus = async (user) => {
        try {
            await AdminService.toggleUserStatus(user.id);
            message.success(`Status de ${user.name} alterado com sucesso.`);
            fetchUsers(pagination.current);
        } catch (error) {
            message.error('Erro ao alterar status.');
        }
    };

    const columns = [
        {
            title: 'Nome',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Perfil',
            dataIndex: 'perfil',
            key: 'perfil',
            render: (role) => <Tag color="blue">{role ? role.toUpperCase() : 'N/A'}</Tag>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status ? 'green' : 'red'}>
                    {status ? 'ATIVO' : 'BLOQUEADO'}
                </Tag>
            )
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Popconfirm
                        title={record.status ? "Bloquear usuário?" : "Ativar usuário?"}
                        description={`Tem certeza que deseja ${record.status ? 'bloquear' : 'ativar'} este usuário?`}
                        onConfirm={() => handleToggleStatus(record)}
                        okText="Sim"
                        cancelText="Não"
                    >
                        <Button
                            type={record.status ? 'primary' : 'default'}
                            danger={record.status}
                            icon={record.status ? <StopOutlined /> : <CheckCircleOutlined />}
                            size="small"
                        >
                            {record.status ? 'Bloquear' : 'Ativar'}
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const handleTableChange = (pag) => {
        fetchUsers(pag.current);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Gestão de Usuários (Governança)</Title>
                <Button icon={<ReloadOutlined />} onClick={() => fetchUsers(pagination.current)}>
                    Atualizar
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
            />
        </div>
    );
};

export default UsersPage;
