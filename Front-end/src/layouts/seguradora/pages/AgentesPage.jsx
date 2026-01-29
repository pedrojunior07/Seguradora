import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Select, message, Card, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserSwitchOutlined } from '@ant-design/icons';
import agenteService from '../../../services/agente.service';
import seguroService from '../../../services/seguroService';

const { Option } = Select;

const AgentesPage = () => {
    const [agentes, setAgentes] = useState([]);
    const [seguros, setSeguros] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        carregarAgentes();
        carregarSeguros();
    }, []);

    const carregarAgentes = async () => {
        setLoading(true);
        try {
            const response = await agenteService.listar();
            // response.data pode ser paginado ou array direto dependendo do controller
            setAgentes(response.data.data || response.data || []);
        } catch (error) {
            message.error('Erro ao carregar agentes');
        } finally {
            setLoading(false);
        }
    };

    const carregarSeguros = async () => {
        try {
            const response = await seguroService.listarSeguros({ per_page: 100 });
            setSeguros(response.data || []);
        } catch (error) {
            message.error('Erro ao carregar seguros');
        }
    };

    const handleSalvar = async (values) => {
        try {
            if (editingId) {
                await agenteService.atualizar(editingId, values);
                message.success('Agente atualizado com sucesso');
            } else {
                await agenteService.criar(values);
                message.success('Agente criado com sucesso');
            }
            setModalVisible(false);
            form.resetFields();
            setEditingId(null);
            carregarAgentes();
        } catch (error) {
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else {
                message.error('Erro ao salvar agente');
            }
        }
    };

    const handleEditar = (record) => {
        setEditingId(record.id_agente);
        // Mapear seguros associados
        const segurosIds = record.segurosSeguradoras?.map(s => s.id) || [];

        form.setFieldsValue({
            nome: record.nome,
            email: record.email,
            telefone: record.telefone,
            documento: record.documento,
            comissao_percentagem: record.seguradoras?.[0]?.pivot?.comissao_percentagem, // Assumindo 1 seguradora
            seguros_ids: segurosIds
        });
        setModalVisible(true);
    };

    const handleExcluir = async (id) => {
        Modal.confirm({
            title: 'Tem certeza?',
            content: 'Isso inativará o agente.',
            okText: 'Sim, inativar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await agenteService.excluir(id);
                    message.success('Agente inativado');
                    carregarAgentes();
                } catch (error) {
                    message.error('Erro ao inativar agente');
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
            dataIndex: 'nome',
            key: 'nome',
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
            title: 'Seguros Associados',
            key: 'seguros',
            render: (_, record) => (
                <span>{record.segurosSeguradoras?.length || 0} seguros</span>
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
                    >
                        Editar
                    </Button>
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleExcluir(record.id_agente)}
                    >
                        Inativar
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
                        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Gestão de Agentes</h2>
                        <p style={{ color: '#666', margin: 0 }}>Gerencie seus agentes e seus produtos autorizados</p>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={openModal}
                        size="large"
                    >
                        Novo Agente
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={agentes}
                    loading={loading}
                    rowKey="id_agente"
                />

                <Modal
                    title={editingId ? "Editar Agente" : "Novo Agente"}
                    open={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    onOk={form.submit}
                    width={700}
                    forceRender
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSalvar}
                    >
                        <Form.Item
                            name="nome"
                            label="Nome Completo"
                            rules={[{ required: true, message: 'Insira o nome' }]}
                        >
                            <Input />
                        </Form.Item>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                                label="Telefone"
                                rules={[{ required: true, message: 'Insira o telefone' }]}
                            >
                                <Input />
                            </Form.Item>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <Form.Item
                                name="documento"
                                label="Documento (BI/NIF)"
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="comissao_percentagem"
                                label="Comissão Global (%)"
                                help="Comissão padrão para vendas"
                            >
                                <InputNumber min={0} max={100} style={{ width: '100%' }} />
                            </Form.Item>
                        </div>

                        <Form.Item
                            name="password"
                            label={editingId ? "Nova Senha (deixe em branco para manter)" : "Senha Inicial (Opcional, padrão: agente123)"}
                            rules={[
                                { min: 6, message: 'Mínimo 6 caracteres' }
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item
                            name="seguros_ids"
                            label="Seguros Autorizados"
                            help="Selecione os seguros que este agente pode comercializar"
                        >
                            <Select
                                mode="multiple"
                                placeholder="Selecione os seguros"
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {seguros.map(seguro => (
                                    <Option key={seguro.id} value={seguro.id}>
                                        {seguro.seguro?.nome || `Seguro #${seguro.id}`}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>
            </Card>
        </div>
    );
};

export default AgentesPage;
