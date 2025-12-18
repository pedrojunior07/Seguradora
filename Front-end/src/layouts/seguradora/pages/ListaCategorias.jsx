import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOpenOutlined } from '@ant-design/icons';
import seguroService from '../../../services/seguroService';

const ListaCategorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('Nova Categoria');
    const [editingId, setEditingId] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        carregarCategorias();
    }, []);

    const carregarCategorias = async () => {
        setLoading(true);
        try {
            const data = await seguroService.listarCategorias();
            setCategorias(data);
        } catch (error) {
            message.error('Erro ao carregar categorias');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdicionar = () => {
        setEditingId(null);
        setModalTitle('Nova Categoria');
        form.resetFields();
        setModalVisible(true);
    };

    const handleEditar = (categoria) => {
        setEditingId(categoria.id_categoria);
        setModalTitle('Editar Categoria');
        form.setFieldsValue({ descricao: categoria.descricao });
        setModalVisible(true);
    };

    const handleExcluir = async (id) => {
        try {
            await seguroService.excluirCategoria(id);
            message.success('Categoria excluída com sucesso');
            carregarCategorias();
        } catch (error) {
            message.error(error.message || 'Erro ao excluir categoria');
        }
    };

    const handleSalvar = async (values) => {
        try {
            if (editingId) {
                await seguroService.atualizarCategoria(editingId, values);
                message.success('Categoria atualizada com sucesso');
            } else {
                await seguroService.criarCategoria(values);
                message.success('Categoria criada com sucesso');
            }
            setModalVisible(false);
            form.resetFields();
            carregarCategorias();
        } catch (error) {
            message.error(error.message || 'Erro ao salvar categoria');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id_categoria',
            key: 'id_categoria',
            width: 80,
        },
        {
            title: 'Descrição',
            dataIndex: 'descricao',
            key: 'descricao',
        },
        {
            title: 'Seguros Ativos',
            dataIndex: 'seguros_count',
            key: 'seguros_count',
            render: (count) => count || 0,
        },
        {
            title: 'Ações',
            key: 'acoes',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEditar(record)}
                        size="small"
                    />
                    <Popconfirm
                        title="Tem certeza que deseja excluir?"
                        description="Esta ação não poderá ser desfeita e falhará se houver seguros associados."
                        onConfirm={() => handleExcluir(record.id_categoria)}
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
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FolderOpenOutlined style={{ fontSize: '24px', color: '#1e40af' }} />
                        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Gestão de Categorias</h1>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdicionar}
                        style={{ background: '#1e40af' }}
                    >
                        Nova Categoria
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={categorias}
                    rowKey="id_categoria"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={modalTitle}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSalvar}
                >
                    <Form.Item
                        name="descricao"
                        label="Nome da Categoria"
                        rules={[{ required: true, message: 'Por favor insira o nome da categoria' }]}
                    >
                        <Input placeholder="Ex: Veículos, Vida, Residencial" />
                    </Form.Item>

                    <Form.Item style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 0 }}>
                        <Space>
                            <Button onClick={() => setModalVisible(false)}>
                                Cancelar
                            </Button>
                            <Button type="primary" htmlType="submit" style={{ background: '#1e40af' }}>
                                Salvar
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ListaCategorias;
