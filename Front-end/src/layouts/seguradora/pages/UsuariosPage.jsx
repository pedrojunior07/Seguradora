import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, message, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import userService from '../../../services/userService';

const UsuariosPage = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        carregarUsuarios();
    }, []);

    const carregarUsuarios = async () => {
        setLoading(true);
        try {
            const response = await userService.listarOperadores();
            setUsuarios(response.data || []);
        } catch (error) {
            message.error('Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    };

    const handleSalvar = async (values) => {
        try {
            if (editingId) {
                await userService.atualizarOperador(editingId, values);
                message.success('Usuário atualizado com sucesso');
            } else {
                await userService.criarOperador(values);
                message.success('Operador criado com sucesso');
            }
            setModalVisible(false);
            form.resetFields();
            setEditingId(null);
            carregarUsuarios();
        } catch (error) {
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else {
                message.error('Erro ao salvar usuário');
            }
        }
    };

    const handleEditar = (record) => {
        setEditingId(record.id);
        form.setFieldsValue({
            name: record.name,
            email: record.email,
            telefone: record.telefone,
            // Senha não é preenchida na edição
        });
        setModalVisible(true);
    };

    const handleExcluir = async (id) => {
        Modal.confirm({
            title: 'Tem certeza?',
            content: 'Isso removerá permanentemente o acesso deste operador.',
            okText: 'Sim, excluir',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await userService.excluirOperador(id);
                    message.success('Operador removido');
                    carregarUsuarios();
                } catch (error) {
                    message.error('Erro ao remover operador');
                }
            },
        });
    };

    const openModal = () => {
        setEditingId(null);
        form.resetFields();
        setModalVisible(true);
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
            title: 'Telefone',
            dataIndex: 'telefone',
            key: 'telefone',
        },
        {
            title: 'Função',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role === 'super_admin' ? 'gold' : 'blue'}>
                    {role === 'super_admin' ? 'Super Admin' : 'Operador'}
                </Tag>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status ? 'green' : 'red'}>
                    {status ? 'Ativo' : 'Inativo'}
                </Tag>
            ),
        },
        {
            title: 'Ações',
            key: 'acoes',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEditar(record)}
                        disabled={record.role === 'super_admin'} // Não pode editar outros admins por aqui
                    >
                        Editar
                    </Button>
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleExcluir(record.id)}
                        disabled={record.role === 'super_admin'} // Não pode excluir admins
                    >
                        Excluir
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Minha Equipe</h2>
                        <p style={{ color: '#666', margin: 0 }}>Gerencie os operadores com acesso ao sistema</p>
                    </div>
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={openModal}
                        size="large"
                    >
                        Novo Operador
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={usuarios}
                    loading={loading}
                    rowKey="id"
                />

                <Modal
                    title={editingId ? "Editar Operador" : "Novo Operador"}
                    open={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    onOk={form.submit}
                    forceRender
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSalvar}
                    >
                        <Form.Item
                            name="name"
                            label="Nome"
                            rules={[{ required: true, message: 'Insira o nome' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Insira o email' },
                                { type: 'email', message: 'Email inválido' }
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="telefone"
                            label="Telefone (Opcional)"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            label={editingId ? "Nova Senha (deixe em branco para manter)" : "Senha Inicial"}
                            rules={[
                                { required: !editingId, message: 'Insira a senha' },
                                { min: 6, message: 'Mínimo 6 caracteres' }
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                    </Form>
                </Modal>
            </Card>
        </div>
    );
};

export default UsuariosPage;
