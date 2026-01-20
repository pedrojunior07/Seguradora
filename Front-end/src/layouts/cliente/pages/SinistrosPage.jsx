import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Tag, Typography, Divider, Upload, Card } from 'antd';
import { PlusOutlined, UploadOutlined, EyeOutlined } from '@ant-design/icons';
import api from '../../../services/api';
import clienteService from '../../../services/cliente.service';
import moment from 'moment';
import ClienteLayout from "../Components/layouts/ClienteLayout";

const { Title, Text } = Typography;

const SinistrosPage = () => {
    const [loading, setLoading] = useState(false);
    const [sinistros, setSinistros] = useState([]);
    const [apolices, setApolices] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const [sinRes, apoRes] = await Promise.all([
                    clienteService.getClaims(),
                    clienteService.getActivePolicies()
                ]);

                if (isMounted) {
                    const sData = sinRes.data || sinRes;
                    setSinistros(Array.isArray(sData) ? sData : []);

                    const aData = apoRes.data || apoRes || [];
                    setApolices(Array.isArray(aData) ? aData : []);
                }
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                if (isMounted) message.error('Erro ao carregar dados');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, []);

    const handleCreateSinistro = async (values) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('apolice_id', values.apolice_id);
            const formattedDate = values.data_ocorrencia ? moment(values.data_ocorrencia).format('YYYY-MM-DD HH:mm:ss') : moment().format('YYYY-MM-DD HH:mm:ss');
            formData.append('data_ocorrencia', formattedDate);
            formData.append('tipo_sinistro', values.tipo_sinistro);
            formData.append('descricao_ocorrencia', values.descricao_ocorrencia);
            formData.append('local_ocorrencia', values.local_ocorrencia);

            if (values.causa_provavel) formData.append('causa_provavel', values.causa_provavel);
            if (values.valor_estimado_dano) formData.append('valor_estimado_dano', values.valor_estimado_dano);

            if (Array.isArray(fileList)) {
                fileList.forEach(file => {
                    formData.append('arquivos[]', file);
                });
            }

            await clienteService.registrarSinistro(formData);

            message.success('Sinistro reportado com sucesso!');
            setIsModalVisible(false);
            form.resetFields();
            setFileList([]);

            // Recarregar lista
            const sinRes = await clienteService.getClaims();
            const sData = sinRes.data || sinRes;
            setSinistros(Array.isArray(sData) ? sData : []);
        } catch (error) {
            console.error('Erro ao reportar:', error);
            message.error(error.message || 'Erro ao reportar sinistro');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Nº Sinistro',
            dataIndex: 'numero_sinistro',
            key: 'numero_sinistro',
            render: (text) => <Text strong>{text || 'PENDENTE'}</Text>
        },
        {
            title: 'Data Ocorrência',
            dataIndex: 'data_ocorrencia',
            key: 'data_ocorrencia',
            render: (date) => date ? moment(date).format('DD/MM/YYYY HH:mm') : 'N/A'
        },
        {
            title: 'Seguro / Categoria',
            key: 'seguro_info',
            render: (_, record) => (
                <div>
                    <Text strong>{record.apolice?.seguradoraSeguro?.seguro?.nome || 'N/A'}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.apolice?.seguradoraSeguro?.seguro?.categoria?.nome} - {record.apolice?.seguradoraSeguro?.seguro?.tipo?.nome}
                    </Text>
                </div>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = {
                    aberto: 'blue',
                    em_analise: 'gold',
                    aprovado: 'green',
                    negado: 'red',
                    pago: 'purple'
                };
                return <Tag color={colors[status] || 'default'}>{status ? String(status).toUpperCase() : 'N/A'}</Tag>;
            }
        },
        {
            title: 'Ações',
            key: 'acoes',
            render: (_, record) => (
                <Space>
                    <Button icon={<EyeOutlined />} size="small">Ver Detalhes</Button>
                </Space>
            )
        }
    ];

    const apoliceOptions = Array.isArray(apolices) ? apolices.map(a => {
        const bem = a.bemSegurado || a.bem_segurado;
        const seguro = a.seguradoraSeguro?.seguro;
        const categoria = seguro?.categoria?.nome || 'N/A';
        const tipoDesc = seguro?.tipo?.nome || 'N/A';

        return {
            value: a.id_apolice,
            label: `${a.numero_apolice || 'N/A'} | ${seguro?.nome} (${categoria} - ${tipoDesc}) | Bem: ${bem?.matricula || bem?.nome || 'N/A'}`
        };
    }) : [];

    const tipoOptions = [
        { value: 'colisao', label: 'Colisão' },
        { value: 'roubo', label: 'Roubo/Furto' },
        { value: 'incendio', label: 'Incêndio' },
        { value: 'danos_naturais', label: 'Danos Naturais' },
        { value: 'outro', label: 'Outro' },
    ];

    const uploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            setFileList(prev => [...prev, file]);
            return false;
        },
        fileList,
        multiple: true,
    };

    return (
        <ClienteLayout>
            <div style={{ padding: '0px' }}>
                <Card bordered={false}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <Title level={2} style={{ margin: 0 }}>Meus Sinistros</Title>
                            <Text type="secondary">Gerencie e acompanhe seus sinistros reportados</Text>
                        </div>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                            Reportar Sinistro
                        </Button>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={sinistros}
                        rowKey="id_sinistro"
                        loading={loading}
                        locale={{ emptyText: 'Nenhum sinistro encontrado' }}
                        scroll={{ x: true }}
                    />
                </Card>

                <Modal
                    title="Reportar Novo Sinistro"
                    open={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={null}
                    width={700}
                    destroyOnClose
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleCreateSinistro}
                    >
                        <Form.Item
                            name="apolice_id"
                            label="Apólice/Seguro"
                            rules={[{ required: true, message: 'Selecione a apólice' }]}
                        >
                            <Select
                                placeholder="Selecione o seguro ativo"
                                options={apoliceOptions}
                            />
                        </Form.Item>

                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <Form.Item
                                name="data_ocorrencia"
                                label="Data e Hora da Ocorrência"
                                style={{ flex: '1 1 300px' }}
                                rules={[{ required: true, message: 'Informe a data' }]}
                                initialValue={moment().format('YYYY-MM-DDTHH:mm')}
                            >
                                <Input type="datetime-local" />
                            </Form.Item>
                            <Form.Item
                                name="tipo_sinistro"
                                label="Tipo de Sinistro"
                                style={{ flex: '1 1 300px' }}
                                rules={[{ required: true, message: 'Selecione o tipo' }]}
                            >
                                <Select
                                    placeholder="Selecione o tipo"
                                    options={tipoOptions}
                                />
                            </Form.Item>
                        </div>

                        <Form.Item
                            name="local_ocorrencia"
                            label="Local da Ocorrência"
                            rules={[{ required: true, message: 'Informe o local' }]}
                        >
                            <Input placeholder="Ex: Av. Julius Nyerere, Maputo" />
                        </Form.Item>

                        <Form.Item
                            name="descricao_ocorrencia"
                            label="Descrição Detalhada"
                            rules={[{ required: true, min: 20, message: 'Descreva detalhadamente (mínimo 20 caracteres)' }]}
                        >
                            <Input.TextArea rows={4} placeholder="Descreva como ocorreu o incidente..." />
                        </Form.Item>

                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <Form.Item
                                name="causa_provavel"
                                label="Causa Provável"
                                style={{ flex: '1 1 300px' }}
                            >
                                <Input placeholder="Ex: Pista escorregadia" />
                            </Form.Item>
                            <Form.Item
                                name="valor_estimado_dano"
                                label="Valor Estimado do Dano"
                                style={{ flex: '1 1 300px' }}
                            >
                                <Input type="number" prefix="MT" placeholder="0.00" />
                            </Form.Item>
                        </div>

                        <Divider orientation="left">Anexos e Fotos</Divider>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
                            Faça upload de fotos do local, danos e documentos relevantes (BO, etc).
                        </Text>

                        <Form.Item label="Arquivos">
                            <Upload {...uploadProps}>
                                <Button icon={<UploadOutlined />}>Selecionar Arquivos</Button>
                            </Upload>
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                            <Space>
                                <Button onClick={() => setIsModalVisible(false)}>Cancelar</Button>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    Enviar Relatório
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </ClienteLayout>
    );
};

export default SinistrosPage;
