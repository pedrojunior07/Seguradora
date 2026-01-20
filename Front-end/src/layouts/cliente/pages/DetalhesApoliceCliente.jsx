import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Spin,
    Typography,
    Descriptions,
    Tag,
    Button,
    Divider,
    Row,
    Col,
    Space,
    Table,
    message,
    Grid
} from 'antd';
import {
    PrinterOutlined,
    ArrowLeftOutlined,
    FileProtectOutlined,
    CarOutlined,
    HomeOutlined,
    SafetyCertificateOutlined
} from '@ant-design/icons';
import { useReactToPrint } from 'react-to-print';
import ClienteLayout from '../Components/layouts/ClienteLayout';
import clienteService from '../../../services/cliente.service';
import moment from 'moment';

const { Title, Text } = Typography;

const DetalhesApoliceCliente = () => {
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;
    const { id } = useParams();
    const navigate = useNavigate();
    const componentRef = useRef();
    const [loading, setLoading] = useState(true);
    const [apolice, setApolice] = useState(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: apolice ? `Apolice_${apolice.numero_apolice}` : 'Apolice',
        pageStyle: `
            @page { margin: 20mm; }
            @media print {
                body { -webkit-print-color-adjust: exact; }
            }
        `
    });

    useEffect(() => {
        fetchApoliceDetails();
    }, [id]);

    const fetchApoliceDetails = async () => {
        try {
            const res = await clienteService.getApoliceById(id);
            setApolice(res.data || res);
        } catch (error) {
            console.error(error);
            message.error('Erro ao carregar detalhes da apólice.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ClienteLayout>
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                </div>
            </ClienteLayout>
        );
    }

    if (!apolice) {
        return (
            <ClienteLayout>
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <p>Apólice não encontrada.</p>
                    <Button onClick={() => navigate('/cliente/apolices')}>Voltar</Button>
                </div>
            </ClienteLayout>
        );
    }

    const isVeiculo = apolice.bem_segurado_type?.includes('Veiculo');
    const bem = apolice.bemSegurado || apolice.bem_segurado;

    return (
        <ClienteLayout>
            <div style={{ paddingBottom: '24px', padding: isMobile ? '0' : 'inherit' }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/cliente/apolices')}
                    style={{ marginBottom: '16px' }}
                >
                    Voltar para Minhas Apólices
                </Button>

                <div
                    ref={componentRef}
                    style={{
                        background: 'white',
                        padding: isMobile ? '24px' : '48px',
                        borderRadius: '2px', // Mais quadrado como papel
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        border: '1px solid #d9d9d9', // Borda de documento
                        fontSize: isMobile ? '12px' : '14px',
                        maxWidth: '850px',
                        margin: '0 auto',
                        position: 'relative',
                        color: '#000' // Garantir contraste na impressão
                    }}
                    className="print-container"
                >
                    {/* Marca D'água ou Borda Decorativa (opcional) */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                        background: 'linear-gradient(90deg, #1890ff 0%, #001529 100%)'
                    }} />
                    {/* Cabeçalho do Documento */}
                    <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        marginBottom: 32,
                        gap: 16
                    }}>
                        <div>
                            <Title level={3} style={{ margin: 0 }}>
                                <FileProtectOutlined style={{ marginRight: '8px' }} />
                                Certificado de Seguro
                            </Title>
                            <Text type="secondary">Apólice Nº {apolice.numero_apolice || 'PENDENTE'}</Text>
                        </div>
                        <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                            <Tag color={apolice.status === 'ativa' ? 'green' : 'blue'} style={{ fontSize: '14px', padding: '4px 8px' }}>
                                {apolice.status?.toUpperCase()}
                            </Tag>
                            <div style={{ marginTop: '8px' }}>
                                <Text type="secondary" style={{ fontSize: '12px' }}>Data de Emissão</Text><br />
                                <Text strong>{moment(apolice.created_at).format('DD/MM/YYYY')}</Text>
                            </div>
                        </div>
                    </div>

                    <Divider />

                    {/* Informações da Seguradora e Cliente */}
                    <Row gutter={[32, 24]}>
                        <Col span={12}>
                            <Title level={5}>Dados da Seguradora</Title>
                            <Space direction="vertical" size={2}>
                                <Text strong>{apolice.seguradora_seguro?.seguradora?.nome}</Text>
                                <Text type="secondary">Endereço: {apolice.seguradora_seguro?.seguradora?.endereco || 'Sede Principal'}</Text>
                                <Text type="secondary">Contacto: {apolice.seguradora_seguro?.seguradora?.telefone || 'Geral'}</Text>
                            </Space>
                        </Col>
                        <Col span={12}>
                            <Title level={5}>Dados do Segurado</Title>
                            <Space direction="vertical" size={2}>
                                <Text strong>{apolice.cliente?.nome}</Text>
                                <Text type="secondary">NIF: {apolice.cliente?.nuit || 'N/A'}</Text>
                                <Text type="secondary">Endereço: {apolice.cliente?.endereco || 'N/A'}</Text>
                            </Space>
                        </Col>
                    </Row>

                    <Divider />

                    {/* Dados do Bem Segurado */}
                    <Title level={5} style={{ display: 'flex', alignItems: 'center' }}>
                        {isVeiculo ? <CarOutlined style={{ marginRight: '8px' }} /> : <HomeOutlined style={{ marginRight: '8px' }} />}
                        Objeto do Seguro
                    </Title>
                    <Descriptions bordered column={2} size="small" style={{ marginTop: '16px' }}>
                        <Descriptions.Item label="Tipo">{isVeiculo ? 'Veículo Automóvel' : 'Propriedade Imóvel'}</Descriptions.Item>
                        <Descriptions.Item label="Descrição">
                            {isVeiculo ? `${bem?.marca || ''} ${bem?.modelo || ''}` : bem?.descricao}
                        </Descriptions.Item>
                        {isVeiculo && bem && (
                            <>
                                <Descriptions.Item label="Matrícula">{bem.matricula}</Descriptions.Item>
                                <Descriptions.Item label="Ano">{bem.ano_fabrico}</Descriptions.Item>
                                <Descriptions.Item label="Cor">{bem.cor}</Descriptions.Item>
                                <Descriptions.Item label="Chassi">{bem.nr_chassi || 'N/A'}</Descriptions.Item>
                            </>
                        )}
                        {!isVeiculo && bem && (
                            <>
                                <Descriptions.Item label="Endereço">{bem.endereco}</Descriptions.Item>
                                <Descriptions.Item label="Tipo">{bem.tipo_propriedade}</Descriptions.Item>
                            </>
                        )}
                        <Descriptions.Item label="Valor Segurado">
                            {parseFloat(apolice.valor_segurado).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider />

                    {/* Coberturas e Vigência */}
                    <Row gutter={[32, 24]}>
                        <Col span={12}>
                            <Title level={5}>Vigência</Title>
                            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text type="secondary">Início:</Text>
                                    <Text strong>{moment(apolice.data_inicio_vigencia).format('DD/MM/YYYY')}</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text type="secondary">Fim:</Text>
                                    <Text strong>{moment(apolice.data_fim_vigencia).format('DD/MM/YYYY')}</Text>
                                </div>
                            </Space>
                        </Col>
                        <Col span={12}>
                            <Title level={5}>Prêmio e Pagamento</Title>
                            <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <Text>Prêmio Total Anual:</Text>
                                    <Text strong style={{ fontSize: '16px' }}>
                                        {parseFloat(apolice.premio_total).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                                    </Text>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <div style={{ marginTop: '24px' }}>
                        <Title level={5}>Coberturas Contratadas</Title>
                        <Table
                            dataSource={apolice.seguradora_seguro?.coberturas || []}
                            pagination={false}
                            size="small"
                            rowKey="id"
                            columns={[
                                { title: 'Cobertura', dataIndex: 'descricao', key: 'descricao' },
                                { title: 'Detalhes', render: () => 'Incluso na apólice' } // Simplificado
                            ]}
                        />
                    </div>

                    <div style={{ marginTop: '40px', textAlign: 'center' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Este documento serve como comprovante de seguro. Em caso de sinistro, contacte imediatamente a seguradora.
                        </Text>
                    </div>
                </div>

                <div style={{
                    marginTop: '24px',
                    textAlign: 'right',
                    position: isMobile ? 'fixed' : 'static',
                    bottom: isMobile ? '24px' : 'auto',
                    right: isMobile ? '24px' : 'auto',
                    zIndex: 1000
                }}>
                    <Button
                        type="primary"
                        size="large"
                        icon={<PrinterOutlined />}
                        onClick={handlePrint}
                        style={isMobile ? {
                            borderRadius: '50px',
                            height: '56px',
                            padding: '0 24px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        } : {}}
                    >
                        {isMobile ? 'Imprimir' : 'Imprimir Apólice'}
                    </Button>
                </div>
            </div>
        </ClienteLayout>
    );
};

export default DetalhesApoliceCliente;
