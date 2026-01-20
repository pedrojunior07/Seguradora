import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag, Button, Typography, Space, Divider, Image, List, Modal, Form, Input, InputNumber, message, Breadcrumb } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, FileTextOutlined, ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons';
import api from '../../../services/api';
import moment from 'moment';
import { useParams, useNavigate, Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const DetalhesSinistroPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [sinistro, setSinistro] = useState(null);
    const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
    const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchSinistro();
    }, [id]);

    const fetchSinistro = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/seguradora/sinistros/${id}`);
            setSinistro(response.data);
        } catch (error) {
            message.error('Erro ao carregar detalhes do sinistro');
            navigate('/seguradora/sinistros');
        } finally {
            setLoading(false);
        }
    };

    const handleStartAnalysis = async () => {
        try {
            await api.post(`/seguradora/sinistros/${id}/analisar`);
            message.success('Análise iniciada');
            fetchSinistro();
        } catch (error) {
            message.error('Erro ao iniciar análise');
        }
    };

    const handleApprove = async (values) => {
        try {
            await api.post(`/seguradora/sinistros/${id}/aprovar`, values);
            message.success('Sinistro aprovado com sucesso');
            setIsApproveModalVisible(false);
            fetchSinistro();
        } catch (error) {
            message.error('Erro ao aprovar sinistro');
        }
    };

    const handleReject = async (values) => {
        try {
            await api.post(`/seguradora/sinistros/${id}/negar`, values);
            message.success('Sinistro negado');
            setIsRejectModalVisible(false);
            fetchSinistro();
        } catch (error) {
            message.error('Erro ao negar sinistro');
        }
    };

    if (loading || !sinistro) return <div>Carregando...</div>;

    const statusColors = {
        aberto: 'blue',
        em_analise: 'gold',
        aprovado: 'green',
        negado: 'red',
        pago: 'purple'
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
                <Breadcrumb items={[
                    { title: <Link to="/seguradora/dashboard">Dashboard</Link> },
                    { title: <Link to="/seguradora/sinistros">Sinistros</Link> },
                    { title: sinistro.numero_sinistro }
                ]} />
            </div>

            <Card
                title={
                    <Space>
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/seguradora/sinistros')} />
                        <Title level={4} style={{ margin: 0 }}>Detalhes do Sinistro: {sinistro.numero_sinistro}</Title>
                        <Tag color={statusColors[sinistro.status]}>{sinistro.status.toUpperCase()}</Tag>
                    </Space>
                }
                extra={
                    <Space>
                        {sinistro.status === 'aberto' && (
                            <Button type="primary" onClick={handleStartAnalysis}>Iniciar Análise</Button>
                        )}
                        {sinistro.status === 'em_analise' && (
                            <>
                                <Button danger icon={<CloseCircleOutlined />} onClick={() => setIsRejectModalVisible(true)}>Negar</Button>
                                <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => setIsApproveModalVisible(true)}>Aprovar</Button>
                            </>
                        )}
                    </Space>
                }
            >
                <Descriptions title="Informações Gerais" bordered column={2}>
                    <Descriptions.Item label="Cliente">{sinistro.apolice?.cliente?.nome}</Descriptions.Item>
                    <Descriptions.Item label="Nº Apólice">{sinistro.apolice?.numero_apolice}</Descriptions.Item>
                    <Descriptions.Item label="Seguro">{sinistro.apolice?.seguradoraSeguro?.seguro?.nome}</Descriptions.Item>
                    <Descriptions.Item label="Categoria">{sinistro.apolice?.seguradoraSeguro?.seguro?.categoria?.nome}</Descriptions.Item>
                    <Descriptions.Item label="Tipo do Seguro">{sinistro.apolice?.seguradoraSeguro?.seguro?.tipo?.nome}</Descriptions.Item>
                    <Descriptions.Item label="Data Ocorrência">{sinistro.data_ocorrencia ? moment(sinistro.data_ocorrencia).format('DD/MM/YYYY HH:mm') : 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Data Comunicação">{sinistro.data_comunicacao ? moment(sinistro.data_comunicacao).format('DD/MM/YYYY HH:mm') : 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Tipo">{sinistro.tipo_sinistro}</Descriptions.Item>
                    <Descriptions.Item label="Local">{sinistro.local_ocorrencia}</Descriptions.Item>
                    <Descriptions.Item label="Valor Estimado">MT {sinistro.valor_estimado_dano || '0.00'}</Descriptions.Item>
                    <Descriptions.Item label="Causa">{sinistro.causa_provavel || 'Não informada'}</Descriptions.Item>
                    <Descriptions.Item label="Descrição" span={2}>
                        <Paragraph>{sinistro.descricao_ocorrencia}</Paragraph>
                    </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Item Segurado</Divider>
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="Tipo">{sinistro.item_segurado_type?.includes('Veiculo') ? 'Veículo' : 'Propriedade'}</Descriptions.Item>
                    <Descriptions.Item label="Identificação">
                        {sinistro.item_segurado?.matricula || sinistro.item_segurado?.nome || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Marca/Modelo" span={2}>
                        {sinistro.item_segurado?.marca} {sinistro.item_segurado?.modelo}
                    </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Evidências e Documentos</Divider>
                <div style={{ marginBottom: '24px' }}>
                    <Title level={5}>Arquivos Anexados</Title>
                    {sinistro.documentos && sinistro.documentos.length > 0 ? (
                        <List
                            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
                            dataSource={sinistro.documentos}
                            renderItem={item => (
                                <List.Item>
                                    <Card
                                        hoverable
                                        cover={
                                            item.tipo === 'imagem' ? (
                                                <Image
                                                    alt={item.nome_original}
                                                    src={`http://localhost:8000/storage/${item.caminho}`}
                                                    style={{ height: 150, objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div style={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                                                    <FileTextOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                                                </div>
                                            )
                                        }
                                        actions={[
                                            <a href={`http://localhost:8000/storage/${item.caminho}`} target="_blank" rel="noreferrer">
                                                <DownloadOutlined key="download" /> Baixar
                                            </a>
                                        ]}
                                    >
                                        <Card.Meta title={item.nome_original} description={`${(item.tamanho / 1024 / 1024).toFixed(2)} MB`} />
                                    </Card>
                                </List.Item>
                            )}
                        />
                    ) : (
                        <Text type="secondary">Nenhum arquivo anexado.</Text>
                    )}
                </div>

                {sinistro.status === 'aprovado' || sinistro.status === 'pago' ? (
                    <>
                        <Divider orientation="left">Resultado da Análise</Divider>
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Valor Aprovado">MT {sinistro.valor_aprovado}</Descriptions.Item>
                            <Descriptions.Item label="Franquia">MT {sinistro.valor_franquia}</Descriptions.Item>
                            <Descriptions.Item label="Valor Indenização">
                                <Text type="success" strong>MT {sinistro.valor_indenizacao}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Data Análise">{sinistro.data_analise ? moment(sinistro.data_analise).format('DD/MM/YYYY') : 'N/A'}</Descriptions.Item>
                        </Descriptions>
                    </>
                ) : sinistro.status === 'negado' ? (
                    <>
                        <Divider orientation="left">Motivo da Negação</Divider>
                        <Card type="inner" style={{ background: '#fff1f0' }}>
                            <Text type="danger">{sinistro.motivo_negacao}</Text>
                        </Card>
                    </>
                ) : null}
            </Card>

            {/* Modal Aprovação */}
            <Modal
                title="Aprovar Sinistro"
                open={isApproveModalVisible}
                onCancel={() => setIsApproveModalVisible(false)}
                onOk={() => form.submit()}
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical" onFinish={handleApprove}>
                    <Form.Item
                        name="valor_aprovado"
                        label="Valor Aprovado (Danos)"
                        rules={[{ required: true, message: 'Informe o valor aprovado' }]}
                    >
                        <InputNumber style={{ width: '100%' }} prefix="MT" min={0} />
                    </Form.Item>
                    <Form.Item
                        name="franquia"
                        label="Valor da Franquia"
                        initialValue={sinistro.apolice?.franquia}
                    >
                        <InputNumber style={{ width: '100%' }} prefix="MT" min={0} />
                    </Form.Item>
                    <Text type="secondary">
                        O valor da indenização será: Valor Aprovado - Franquia.
                    </Text>
                </Form>
            </Modal>

            {/* Modal Negação */}
            <Modal
                title="Negar Sinistro"
                open={isRejectModalVisible}
                onCancel={() => setIsRejectModalVisible(false)}
                onOk={() => form.submit()}
                danger
                okText="Negar Sinistro"
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical" onFinish={handleReject}>
                    <Form.Item
                        name="motivo"
                        label="Motivo da Negação"
                        rules={[{ required: true, min: 20, message: 'Descreva o motivo (min 20 caracteres)' }]}
                    >
                        <Input.TextArea rows={4} placeholder="Descreva tecnicamente o motivo da negação..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default DetalhesSinistroPage;
