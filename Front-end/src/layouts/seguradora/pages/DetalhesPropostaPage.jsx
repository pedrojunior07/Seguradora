import React, { useEffect, useState } from 'react';
import {
    Card,
    Descriptions,
    Button,
    Typography,
    Tag,
    Space,
    Divider,
    Row,
    Col,
    message,
    Modal,
    Input,
    Spin,
    Image,
    List,
    Grid
} from 'antd';
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    FileProtectOutlined,
    UserOutlined,
    CarOutlined,
    HomeOutlined,
    CreditCardOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import seguradoraService from '../../../services/seguradora.service';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const DetalhesPropostaPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;
    const [proposta, setProposta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const fetchProposta = async () => {
        try {
            setLoading(true);
            const res = await seguradoraService.getProposta(id);
            setProposta(res);
        } catch (error) {
            console.error(error);
            message.error('Erro ao carregar detalhes da proposta.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProposta();
    }, [id]);

    const handleAprovar = () => {
        Modal.confirm({
            title: 'Confirmar Aprovação',
            content: 'Tem certeza que deseja aprovar esta proposta? Uma apólice será gerada automaticamente.',
            okText: 'Aprovar',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    setActionLoading(true);
                    await seguradoraService.aprovarProposta(id);
                    message.success('Proposta aprovada com sucesso!');
                    fetchProposta(); // Recarregar para atualizar status
                } catch (error) {
                    message.error('Erro ao aprovar proposta.');
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    const handleRejeitar = async () => {
        if (!rejectReason.trim()) {
            message.warning('Informe o motivo da rejeição.');
            return;
        }

        try {
            setActionLoading(true);
            await seguradoraService.rejeitarProposta(id, rejectReason);
            message.success('Proposta rejeitada.');
            setRejectModalOpen(false);
            fetchProposta();
        } catch (error) {
            message.error('Erro ao rejeitar proposta.');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
    if (!proposta) return <div style={{ textAlign: 'center', padding: 50 }}><Text>Proposta não encontrada.</Text></div>;

    const bem = proposta.bem;
    const seguro = proposta.seguradora_seguro?.seguro;
    const cliente = proposta.cliente;

    const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/api\/?$/, '');
    const getFileUrl = (path) => (path ? `${apiBase}/storage/${path}` : null);

    return (
        <div style={{ padding: isMobile ? '12px' : '24px' }}>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/seguradora/propostas')}
                style={{ marginBottom: 16 }}
            >
                Voltar
            </Button>

            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                marginBottom: 24,
                gap: 16
            }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>
                        Proposta #{proposta.numero_proposta}
                    </Title>
                    <Text type="secondary">Enviada em {new Date(proposta.created_at).toLocaleDateString()}</Text>
                </div>
                <div>
                    {proposta.status === 'em_analise' ? (
                        <Space>
                            <Button
                                type="primary"
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => setRejectModalOpen(true)}
                                loading={actionLoading}
                            >
                                Rejeitar
                            </Button>
                            <Button
                                type="primary"
                                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                icon={<CheckCircleOutlined />}
                                onClick={handleAprovar}
                                loading={actionLoading}
                            >
                                Aprovar
                            </Button>
                        </Space>
                    ) : (
                        <Tag
                            color={
                                proposta.status === 'aprovada' && proposta.apolice?.status === 'pendente_aprovacao' ? 'orange' :
                                    proposta.status === 'aprovada' ? 'success' :
                                        proposta.status === 'rejeitada' ? 'error' : 'default'
                            }
                            style={{ fontSize: '14px', padding: '4px 10px' }}
                        >
                            {proposta.status === 'aprovada' && proposta.apolice?.status === 'pendente_aprovacao' ? 'APROVADA - AGUARDANDO PAGAMENTO' : proposta.status.toUpperCase()}
                        </Tag>
                    )}
                </div>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                    <Card title={<><UserOutlined /> Dados do Cliente</>}>
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Nome">{cliente?.nome}</Descriptions.Item>
                            <Descriptions.Item label="Tipo">{cliente?.tipo_cliente === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}</Descriptions.Item>
                            <Descriptions.Item label="NUIT">{cliente?.nuit || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Email">{cliente?.email}</Descriptions.Item>
                            <Descriptions.Item label="Telefone Principal">{cliente?.telefone1 || 'N/A'}</Descriptions.Item>
                            {cliente?.telefone2 && (
                                <Descriptions.Item label="Telefone Secundário">{cliente?.telefone2}</Descriptions.Item>
                            )}
                            <Descriptions.Item label="Endereço">{cliente?.endereco || 'N/A'}</Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card title={<><FileProtectOutlined /> Detalhes do Seguro</>} style={{ marginTop: 24 }}>
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Produto">{seguro?.nome}</Descriptions.Item>
                            <Descriptions.Item label="Seguradora">{proposta.seguradora_seguro?.seguradora?.nome}</Descriptions.Item>
                            <Descriptions.Item label="Prêmio Calculado">
                                <Text strong style={{ color: '#1890ff' }}>
                                    {parseFloat(proposta.premio_calculado).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Coberturas">
                                <ul>
                                    {proposta.coberturas_selecionadas?.map((c, i) => (
                                        <li key={i}>{c.descricao} {c.valor_cobertura && `(${c.valor_cobertura})`}</li>
                                    ))}
                                </ul>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card title={<>{proposta.tipo_proposta === 'veiculo' ? <CarOutlined /> : <HomeOutlined />} Dados do Bem</>}>
                        {proposta.tipo_proposta === 'veiculo' ? (
                            <Descriptions column={1} bordered size="small">
                                <Descriptions.Item label="Marca">{bem?.marca}</Descriptions.Item>
                                <Descriptions.Item label="Modelo">{bem?.modelo}</Descriptions.Item>
                                <Descriptions.Item label="Matrícula">{bem?.matricula}</Descriptions.Item>
                                <Descriptions.Item label="Ano">{bem?.ano_fabrico}</Descriptions.Item>
                                <Descriptions.Item label="Cor">{bem?.cor}</Descriptions.Item>
                                <Descriptions.Item label="Valor Estimado">
                                    {parseFloat(proposta.valor_bem).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                                </Descriptions.Item>
                            </Descriptions>
                        ) : (
                            <Descriptions column={1} bordered size="small">
                                <Descriptions.Item label="Descrição">{bem?.descricao}</Descriptions.Item>
                                <Descriptions.Item label="Endereço">{bem?.endereco}</Descriptions.Item>
                                <Descriptions.Item label="Tipo">{bem?.tipo_propriedade}</Descriptions.Item>
                                <Descriptions.Item label="Valor Estimado">
                                    {parseFloat(proposta.valor_bem).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                                </Descriptions.Item>
                            </Descriptions>
                        )}
                    </Card>

                    {proposta.tipo_proposta === 'veiculo' && bem?.fotos && bem.fotos.length > 0 && (
                        <Card title="Imagens do Veículo" style={{ marginTop: 24 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
                                {bem.fotos.map((foto, index) => (
                                    <div key={index} style={{ textAlign: 'center' }}>
                                        <Image
                                            src={getFileUrl(foto.caminho)}
                                            alt={`Foto ${foto.tipo}`}
                                            placeholder={<div style={{ padding: 20, background: '#f5f5f5' }}><Spin size="small" /></div>}
                                            style={{ borderRadius: 8, objectFit: 'cover', height: 100, width: '100%' }}
                                        />
                                        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
                                            {foto.tipo.charAt(0).toUpperCase() + foto.tipo.slice(1).replace('_', ' ')}
                                        </Text>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {proposta.status === 'aprovada' && proposta.apolice?.status === 'pendente_aprovacao' && (
                        <Card style={{ marginTop: 24, background: '#fff7e6', borderColor: '#ffd591' }}>
                            <Title level={4} style={{ color: '#fa8c16' }}><CreditCardOutlined /> Pendente Aprovação</Title>
                            <Paragraph>A proposta foi aprovada! Para ativar o seguro e iniciar a vigência, o pagamento deve ser confirmado.</Paragraph>

                            {proposta.apolice.pagamentos && proposta.apolice.pagamentos.length > 0 && (
                                <div style={{ marginBottom: 16 }}>
                                    <Text strong>Ordem de Pagamento:</Text> {proposta.apolice.pagamentos[0].numero_pagamento}
                                    <br />
                                    <Text strong>Valor:</Text> {parseFloat(proposta.apolice.pagamentos[0].valor_parcela).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                                </div>
                            )}

                            <Button
                                type="primary"
                                style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
                                icon={<CreditCardOutlined />}
                                onClick={() => {
                                    Modal.confirm({
                                        title: 'Simular Pagamento',
                                        content: 'Deseja confirmar o pagamento desta proposta ficticiamente para ativar o seguro?',
                                        okText: 'Confirmar Pagamento',
                                        onOk: async () => {
                                            try {
                                                setActionLoading(true);
                                                await seguradoraService.confirmarPagamento(proposta.apolice.pagamentos[0].id_pagamento);
                                                message.success('Pagamento confirmado e seguro ativado!');
                                                fetchProposta();
                                            } catch (error) {
                                                message.error('Erro ao confirmar pagamento.');
                                            } finally {
                                                setActionLoading(false);
                                            }
                                        }
                                    });
                                }}
                                loading={actionLoading}
                            >
                                Simular Pagamento do Cliente
                            </Button>
                        </Card>
                    )}

                    {proposta.status === 'aprovada' && proposta.apolice?.status === 'ativa' && (
                        <Card style={{ marginTop: 24, background: '#f6ffed', borderColor: '#b7eb8f' }}>
                            <Title level={4} style={{ color: '#52c41a' }}><CheckCircleOutlined /> Apólice Ativa</Title>
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Número">{proposta.apolice.numero_apolice}</Descriptions.Item>
                                <Descriptions.Item label="Início da Vigência">{new Date(proposta.apolice.data_inicio_vigencia).toLocaleDateString()}</Descriptions.Item>
                                <Descriptions.Item label="Fim da Vigência">{new Date(proposta.apolice.data_fim_vigencia).toLocaleDateString()}</Descriptions.Item>
                            </Descriptions>
                            <Divider style={{ margin: '12px 0' }} />
                            <Button type="link" onClick={() => navigate(`/seguradora/apolices/${proposta.apolice_gerada_id}`)}>
                                Ver Detalhes da Apólice
                            </Button>
                        </Card>
                    )}

                    {proposta.status === 'rejeitada' && (
                        <Card style={{ marginTop: 24, background: '#fff1f0', borderColor: '#ffa39e' }}>
                            <Title level={4} style={{ color: '#cf1322' }}><CloseCircleOutlined /> Proposta Rejeitada</Title>
                            <Text strong>Motivo:</Text>
                            <Paragraph>{proposta.motivo_rejeicao}</Paragraph>
                        </Card>
                    )}
                </Col>
            </Row>

            <Modal
                title="Rejeitar Proposta"
                open={rejectModalOpen}
                onOk={handleRejeitar}
                onCancel={() => setRejectModalOpen(false)}
                okText="Rejeitar"
                okButtonProps={{ danger: true, loading: actionLoading }}
                cancelButtonProps={{ disabled: actionLoading }}
            >
                <div style={{ marginBottom: 16 }}>
                    <Text>Por favor, informe o motivo da rejeição para o cliente:</Text>
                </div>
                <TextArea
                    rows={4}
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Ex: Documentação inválida, Risco elevado, etc."
                />
            </Modal>
        </div>
    );
};

export default DetalhesPropostaPage;
