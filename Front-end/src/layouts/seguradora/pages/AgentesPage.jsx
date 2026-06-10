import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Select, message, Card, InputNumber, Tooltip, List, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MinusCircleOutlined, FileProtectOutlined, EyeOutlined } from '@ant-design/icons';
import agenteService from '../../../services/agente.service';
import api from '../../../services/api';

const { Option } = Select;
const { Text } = Typography;

const AgentesPage = () => {
    const [agentes, setAgentes] = useState([]);
    const [seguros, setSeguros] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [segurosModal, setSegurosModal] = useState({ open: false, agente: null, lista: [] });
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
            const response = await api.get('/seguradora/seguros', { params: { per_page: 100 } });
            const body = response.data;
            // suporta resposta paginada {data:[...]} e array direto [...]
            const lista = Array.isArray(body) ? body : (body?.data ?? []);
            setSeguros(lista);
        } catch (error) {
            message.error('Erro ao carregar seguros');
        }
    };

    const handleSalvar = async (values) => {
        console.log('[AgentesPage] submit values:', JSON.stringify(values, null, 2));
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
            const msg = error.message || error.data?.message || error.response?.data?.message || 'Erro ao salvar agente';
            message.error(msg);
        }
    };

    const handleEditar = (record) => {
        setEditingId(record.id_agente);
        const seguros = (record.seguros_seguradoras || record.segurosSeguradoras)?.map(s => ({
            id: s.id,
            percentagem_comissao_angariacao: s.pivot?.percentagem_comissao_angariacao ?? 0,
            percentagem_comissao_cobranca:   s.pivot?.percentagem_comissao_cobranca ?? 0,
        })) || [];

        form.setFieldsValue({
            nome:      record.nome,
            email:     record.email,
            telefone:  record.telefone,
            documento: record.documento,
            seguros,
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
            title: 'Seguros Autorizados',
            key: 'seguros',
            render: (_, record) => {
                const lista = record.seguros_seguradoras || record.segurosSeguradoras || [];
                if (lista.length === 0) return <Tag>Nenhum</Tag>;
                return (
                    <Tooltip title="Clique para ver detalhes">
                        <Tag
                            color="blue"
                            icon={<EyeOutlined />}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSegurosModal({ open: true, agente: record, lista })}
                        >
                            {lista.length} seguro(s)
                        </Tag>
                    </Tooltip>
                );
            },
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
        <div className="page-container">
            <Card>
                <div className="page-header-row">
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

                {/* Modal Seguros do Agente */}
                <Modal
                    open={segurosModal.open}
                    onCancel={() => setSegurosModal({ open: false, agente: null, lista: [] })}
                    footer={null}
                    width={500}
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FileProtectOutlined style={{ color: '#2563eb' }} />
                            <span>Seguros autorizados — {segurosModal.agente?.nome}</span>
                        </div>
                    }
                >
                    <List
                        dataSource={segurosModal.lista}
                        renderItem={s => (
                            <List.Item style={{ padding: '12px 0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: 34, height: 34, borderRadius: '10px',
                                            background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                        }}>
                                            <FileProtectOutlined style={{ color: '#2563eb', fontSize: '15px' }} />
                                        </div>
                                        <Text strong style={{ fontSize: '14px' }}>
                                            {s.seguro?.nome || `Seguro #${s.id}`}
                                        </Text>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <Tag color="green" style={{ borderRadius: '20px', margin: 0 }}>
                                            Ang. {parseFloat(s.pivot?.percentagem_comissao_angariacao ?? 0).toFixed(1)}%
                                        </Tag>
                                        <Tag color="blue" style={{ borderRadius: '20px', margin: 0 }}>
                                            Cob. {parseFloat(s.pivot?.percentagem_comissao_cobranca ?? 0).toFixed(1)}%
                                        </Tag>
                                    </div>
                                </div>
                            </List.Item>
                        )}
                        style={{ maxHeight: '420px', overflowY: 'auto' }}
                    />
                </Modal>

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

                        <div className="resp-grid-2">
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

                        <div className="resp-grid-2">
                            <Form.Item name="documento" label="Documento (BI/NIF)">
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="password"
                                label={editingId ? 'Nova Senha (deixe em branco para manter)' : 'Senha Inicial (padrão: agente123)'}
                                rules={[{ min: 6, message: 'Mínimo 6 caracteres' }]}
                            >
                                <Input.Password />
                            </Form.Item>
                        </div>

                        <div style={{ marginBottom: 8, fontWeight: 500 }}>Seguros e Comissões</div>
                        <div className="agents-seguros-header">
                            <span style={{ color: '#888', fontSize: 12 }}>Seguro</span>
                            <span style={{ color: '#888', fontSize: 12 }}>Angariação (%)</span>
                            <span style={{ color: '#888', fontSize: 12 }}>Cobrança (%)</span>
                            <span />
                        </div>
                        <Form.List name="seguros">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...rest }) => (
                                        <div key={key} className="agents-seguros-row">
                                            <Form.Item {...rest} name={[name, 'id']} rules={[{ required: true, message: 'Selecione o seguro' }]} style={{ margin: 0 }}>
                                                <Select placeholder="Selecione o seguro" showSearch optionFilterProp="children">
                                                    {seguros.map(s => (
                                                        <Option key={s.id} value={s.id}>
                                                            {s.seguro?.nome || `Seguro #${s.id}`}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                            <Form.Item {...rest} name={[name, 'percentagem_comissao_angariacao']} style={{ margin: 0 }}>
                                                <InputNumber min={0} max={100} step={0.5} placeholder="0" style={{ width: '100%' }} />
                                            </Form.Item>
                                            <Form.Item {...rest} name={[name, 'percentagem_comissao_cobranca']} style={{ margin: 0 }}>
                                                <InputNumber min={0} max={100} step={0.5} placeholder="0" style={{ width: '100%' }} />
                                            </Form.Item>
                                            <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} style={{ marginTop: 4 }} />
                                        </div>
                                    ))}
                                    <Form.Item style={{ marginTop: 4 }}>
                                        <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                                            Adicionar Seguro
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </Form>
                </Modal>
            </Card>
        </div>
    );
};

export default AgentesPage;
