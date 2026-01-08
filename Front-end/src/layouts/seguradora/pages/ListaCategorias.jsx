import React, { useState, useEffect } from 'react';
import {
    Card, Table, Button, Modal, Form, Input,
    message, Space, Popconfirm, Tag, Tooltip, Switch
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    FolderOpenOutlined, AppstoreOutlined, SettingOutlined
} from '@ant-design/icons';
import seguroService from '../../../services/seguroService';
import { useAuth } from '../../../context/AuthContext';

const ListaCategorias = () => {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'super_admin';

    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal Categoria
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('Nova Categoria');
    const [editingId, setEditingId] = useState(null);
    const [form] = Form.useForm();

    // Modal Tipo Seguro
    const [modalTipoVisible, setModalTipoVisible] = useState(false);
    const [modalTipoTitle, setModalTipoTitle] = useState('Novo Tipo de Seguro');
    const [editingTipoId, setEditingTipoId] = useState(null);
    const [currentCategoriaId, setCurrentCategoriaId] = useState(null);
    const [formTipo] = Form.useForm();

    useEffect(() => {
        carregarCategorias();
    }, []);

    const carregarCategorias = async () => {
        setLoading(true);
        try {
            const data = await seguroService.listarCategorias();
            // Backend retorna array de categorias
            setCategorias(data);
        } catch (error) {
            message.error('Erro ao carregar categorias');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // --- Categoria Handlers ---
    const handleAdicionarCategoria = () => {
        setEditingId(null);
        setModalTitle('Nova Categoria');
        form.resetFields();
        form.setFieldsValue({ status: true });
        setModalVisible(true);
    };

    const handleEditarCategoria = (categoria) => {
        setEditingId(categoria.id_categoria);
        setModalTitle('Editar Categoria');
        form.setFieldsValue({
            descricao: categoria.descricao,
            status: categoria.status
        });
        setModalVisible(true);
    };

    const handleExcluirCategoria = async (id) => {
        try {
            await seguroService.excluirCategoria(id);
            message.success('Categoria excluída com sucesso');
            carregarCategorias();
        } catch (error) {
            message.error(error.message || 'Erro ao excluir categoria');
        }
    };

    const handleSalvarCategoria = async (values) => {
        try {
            if (editingId) {
                await seguroService.atualizarCategoria(editingId, values);
                message.success('Categoria atualizada com sucesso');
            } else {
                await seguroService.criarCategoria(values);
                message.success('Categoria criada com sucesso');
            }
            setModalVisible(false);
            carregarCategorias();
        } catch (error) {
            message.error(error.message || 'Erro ao salvar categoria');
        }
    };

    // --- Tipo Seguro Handlers ---
    const handleAdicionarTipo = (idCategoria) => {
        setEditingTipoId(null);
        setCurrentCategoriaId(idCategoria);
        setModalTipoTitle('Novo Tipo de Seguro');
        formTipo.resetFields();
        formTipo.setFieldsValue({ status: true });
        setModalTipoVisible(true);
    };

    const handleEditarTipo = (tipo) => {
        setEditingTipoId(tipo.id);
        setCurrentCategoriaId(tipo.id_categoria);
        setModalTipoTitle('Editar Tipo de Seguro');
        formTipo.setFieldsValue({
            descricao: tipo.descricao,
            status: tipo.status
        });
        setModalTipoVisible(true);
    };

    const handleExcluirTipo = async (id) => {
        try {
            await seguroService.excluirTipo(id);
            message.success('Tipo de seguro excluído');
            carregarCategorias();
        } catch (error) {
            message.error(error.message || 'Erro ao excluir tipo');
        }
    };

    const handleSalvarTipo = async (values) => {
        try {
            const payload = { ...values, id_categoria: currentCategoriaId };

            if (editingTipoId) {
                await seguroService.atualizarTipo(editingTipoId, payload);
                message.success('Tipo atualizado com sucesso');
            } else {
                await seguroService.criarTipo(payload);
                message.success('Tipo criado com sucesso');
            }
            setModalTipoVisible(false);
            carregarCategorias();
        } catch (error) {
            message.error(error.message || 'Erro ao salvar tipo');
        }
    };

    // --- Colunas ---
    const columns = [
        {
            title: 'Categoria',
            dataIndex: 'descricao',
            key: 'descricao',
            render: (text) => <span className="font-semibold text-lg">{text}</span>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status) => (
                <Tag color={status ? 'green' : 'red'}>
                    {status ? 'ATIVO' : 'INATIVO'}
                </Tag>
            )
        },
        {
            title: 'Seguros',
            dataIndex: 'seguros_count',
            key: 'seguros_count',
            width: 100,
            render: (count) => <Tag color="blue">{count} Seguros</Tag>,
        },
        ...(isSuperAdmin ? [{
            title: 'Ações',
            key: 'acoes',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Editar">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => handleEditarCategoria(record)}
                            size="small"
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Excluir categoria?"
                        description="Isso excluirá também os tipos associados."
                        onConfirm={() => handleExcluirCategoria(record.id_categoria)}
                        okText="Sim"
                        cancelText="Não"
                    >
                        <Tooltip title="Excluir">
                            <Button
                                icon={<DeleteOutlined />}
                                danger
                                size="small"
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        }] : []),
    ];

    // --- Sub Tabela (Tipos) ---
    const expandedRowRender = (categoria) => {
        const tiposColumns = [
            {
                title: 'Tipo de Seguro',
                dataIndex: 'descricao',
                key: 'descricao'
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                width: 100,
                render: (status) => (
                    <Tag color={status ? 'green' : 'red'}>
                        {status ? 'ATIVO' : 'INATIVO'}
                    </Tag>
                )
            },
            ...(isSuperAdmin ? [{
                title: 'Ações',
                key: 'acoes',
                width: 120,
                render: (_, record) => (
                    <Space>
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => handleEditarTipo(record)}
                            size="small"
                        />
                        <Popconfirm
                            title="Excluir tipo?"
                            onConfirm={() => handleExcluirTipo(record.id)}
                            okText="Sim"
                            cancelText="Não"
                        >
                            <Button
                                icon={<DeleteOutlined />}
                                danger
                                size="small"
                            />
                        </Popconfirm>
                    </Space>
                )
            }] : [])
        ];

        return (
            <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="m-0 font-bold text-gray-600">Tipos de Seguro ({categoria.descricao})</h4>
                    {isSuperAdmin && (
                        <Button
                            type="dashed"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => handleAdicionarTipo(categoria.id_categoria)}
                        >
                            Adicionar Tipo
                        </Button>
                    )}
                </div>
                <Table
                    columns={tiposColumns}
                    dataSource={categoria.tipos}
                    pagination={false}
                    rowKey="id"
                    size="small"
                    locale={{ emptyText: 'Nenhum tipo cadastrado' }}
                />
            </div>
        );
    };

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FolderOpenOutlined style={{ fontSize: '24px', color: '#1e40af' }} />
                        <div>
                            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Gestão de Categorias e Tipos</h1>
                            <p className="text-gray-400 m-0">Administre as classificações de seguros</p>
                        </div>
                    </div>
                    {isSuperAdmin && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAdicionarCategoria}
                            style={{ background: '#1e40af' }}
                        >
                            Nova Categoria
                        </Button>
                    )}
                </div>

                <Table
                    columns={columns}
                    dataSource={categorias}
                    rowKey="id_categoria"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    expandable={{
                        expandedRowRender,
                        rowExpandable: (record) => true,
                    }}
                />
            </Card>

            {/* Modal Categoria */}
            <Modal
                title={modalTitle}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleSalvarCategoria}>
                    <Form.Item name="descricao" label="Nome da Categoria" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="status" label="Status" valuePropName="checked">
                        <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
                    </Form.Item>
                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setModalVisible(false)}>Cancelar</Button>
                        <Button type="primary" htmlType="submit">Salvar</Button>
                    </div>
                </Form>
            </Modal>

            {/* Modal Tipo Seguro */}
            <Modal
                title={modalTipoTitle}
                open={modalTipoVisible}
                onCancel={() => setModalTipoVisible(false)}
                footer={null}
            >
                <Form form={formTipo} layout="vertical" onFinish={handleSalvarTipo}>
                    <Form.Item name="descricao" label="Descrição do Tipo" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="status" label="Status" valuePropName="checked">
                        <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
                    </Form.Item>
                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setModalTipoVisible(false)}>Cancelar</Button>
                        <Button type="primary" htmlType="submit">Salvar</Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default ListaCategorias;
