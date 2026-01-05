import React, { useState, useEffect } from 'react';
import {
    Table, Card, Button, Input, Modal, Form,
    Select, Tag, Space, message, Typography
} from 'antd';
import {
    PlusOutlined, SearchOutlined, UserOutlined,
    PhoneOutlined, MailOutlined, IdcardOutlined
} from '@ant-design/icons';
import api from '../../../services/api';

const { Title } = Typography;
const { Option } = Select;

const ListaClientes = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        fetchClientes();
    }, []);

    const fetchClientes = async () => {
        setLoading(true);
        try {
            const response = await api.get('/seguradora/clientes');
            setClientes(response.data.data || []);
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            message.error('Falha ao carregar clientes');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (values) => {
        try {
            await api.post('/seguradora/clientes', values);
            message.success('Cliente criado com sucesso!');
            setIsModalVisible(false);
            form.resetFields();
            fetchClientes();
        } catch (error) {
            console.error('Erro ao criar cliente:', error);
            message.error('Erro ao criar cliente. Verifique os dados.');
        }
    };

    const columns = [
        {
            title: 'Nome',
            dataIndex: 'nome',
            key: 'nome',
            render: (text) => <span className="font-semibold">{text}</span>,
        },
        {
            title: 'Tipo',
            dataIndex: 'tipo_cliente',
            key: 'tipo_cliente',
            render: (tipo) => (
                <Tag color={tipo === 'fisica' ? 'blue' : 'purple'}>
                    {tipo ? tipo.toUpperCase() : 'N/A'}
                </Tag>
            ),
        },
        {
            title: 'Documento / NUIT',
            dataIndex: 'nuit',
            key: 'nuit',
            render: (text, record) => (
                <div className="text-sm">
                    <div><IdcardOutlined /> {text}</div>
                    {record.documento && <div className="text-gray-500 text-xs">{record.documento}</div>}
                </div>
            )
        },
        {
            title: 'Contato',
            key: 'contato',
            render: (_, record) => (
                <div className="text-sm">
                    <div><MailOutlined /> {record.email}</div>
                    <div><PhoneOutlined /> {record.telefone1}</div>
                </div>
            ),
        },
        {
            title: 'Ações',
            key: 'acoes',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" size="small">Detalhes</Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Title level={2} style={{ margin: 0 }}>Gestão de Clientes</Title>
                    <p className="text-gray-500">Visualize e cadastre novos clientes</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={() => setIsModalVisible(true)}
                    style={{ background: '#4f46e5', borderColor: '#4f46e5' }}
                >
                    Novo Cliente
                </Button>
            </div>

            <Card bordered={false} className="shadow-sm rounded-lg">
                <div className="mb-4">
                    <Input
                        placeholder="Buscar por nome ou NUIT..."
                        prefix={<SearchOutlined />}
                        style={{ width: 300 }}
                        onChange={e => setSearchText(e.target.value)}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={clientes}
                    rowKey="id_cliente"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title="Novo Cliente"
                open={isModalVisible} // AntD v5 uses 'open', v4 uses 'visible'
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreate}
                    initialValues={{ tipo_cliente: 'fisica', password: 'password123' }}
                >
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="tipo_cliente" label="Tipo de Cliente" rules={[{ required: true }]}>
                            <Select>
                                <Option value="fisica">Pessoa Física</Option>
                                <Option value="juridica">Pessoa Jurídica (Empresa)</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="nome_completo" label="Nome Completo / Razão Social" rules={[{ required: true }]}>
                            <Input prefix={<UserOutlined />} />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="nuit" label="NUIT" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="documento" label="Documento (BI/Passaporte)">
                            <Input />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="email" label="E-mail" rules={[{ required: true, type: 'email' }]}>
                            <Input prefix={<MailOutlined />} />
                        </Form.Item>
                        <Form.Item name="telefone1" label="Telefone Principal" rules={[{ required: true }]}>
                            <Input prefix={<PhoneOutlined />} />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="telefone2" label="Telefone Secundário">
                            <Input prefix={<PhoneOutlined />} />
                        </Form.Item>
                        <Form.Item name="password" label="Senha Inicial (para login do cliente)">
                            <Input.Password />
                        </Form.Item>
                    </div>

                    <Form.Item name="endereco" label="Endereço Completo">
                        <Input.TextArea rows={2} />
                    </Form.Item>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button onClick={() => setIsModalVisible(false)}>Cancelar</Button>
                        <Button type="primary" htmlType="submit">Cadastrar Cliente</Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default ListaClientes;
