import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Upload, 
  Button, 
  Steps, 
  Alert, 
  Space, 
  message, 
  Divider, 
  Row, 
  Col,
  Tag,
  Form,
  Input,
  Result,
  ConfigProvider
} from 'antd';
import { STORAGE_BASE_URL } from '@services/api';
import { 
  InboxOutlined, 
  FileProtectOutlined, 
  BankOutlined, 
  IdcardOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CloudUploadOutlined,
  UploadOutlined,
  SearchOutlined,
  FileTextOutlined, 
  SafetyCertificateOutlined,
  EyeOutlined
} from '@ant-design/icons';
import seguradoraService from '@services/seguradora.service';

const { Title, Text, Paragraph } = Typography;

const VerificacaoConta = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState({
        licenca_br: [],
        nuit_file: [],
        bank_details_file: []
    });

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const data = await seguradoraService.getVerificacaoStatus();
            setStatus(data);
        } catch (error) {
            message.error('Erro ao carregar status de verificação');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const handleUpload = async (values) => {
        if (!fileList.licenca_br.length || !fileList.nuit_file.length || !fileList.bank_details_file.length) {
            message.warning('Por favor, anexe todos os documentos obrigatórios.');
            return;
        }

        const formData = new FormData();
        
        if (fileList.licenca_br[0]) formData.append('licenca_br', fileList.licenca_br[0].originFileObj);
        if (fileList.nuit_file[0]) formData.append('nuit_file', fileList.nuit_file[0].originFileObj);
        if (fileList.bank_details_file[0]) formData.append('bank_details_file', fileList.bank_details_file[0].originFileObj);
        
        formData.append('nome_banco', values.nome_banco);
        formData.append('numero_conta', values.numero_conta);
        formData.append('titular', values.titular);

        setLoading(true);
        try {
            await seguradoraService.uploadDocumentos(formData);
            message.success('Documentos enviados com sucesso!');
            fetchStatus();
        } catch (error) {
            console.error('Erro no upload:', error);
            if (error.status === 401) {
                message.error('Sessão expirada. Por favor, faça login novamente em outra aba para continuar.');
            } else {
                message.error(error.message || 'Erro ao enviar documentos. Verifique o tamanho dos arquivos (máx 2MB).');
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusHeader = () => {
        if (!status) return null;

        switch (status.status_verificacao) {
            case 'aprovado':
                return (
                    <Alert
                        message={<span style={{ fontWeight: 700, fontSize: '16px' }}>Conta Verificada</span>}
                        description={<span style={{ color: '#1a2e1a' }}>Sua seguradora está totalmente verificada e autorizada a operar no sistema.</span>}
                        type="success"
                        showIcon
                        icon={<CheckCircleOutlined style={{ fontSize: '24px' }} />}
                        className="rounded-2xl border-success"
                        style={{ padding: '20px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', marginBottom: '32px' }}
                    />
                );
            case 'pendente':
                return (
                    <Alert
                        message={<span style={{ fontWeight: 700, fontSize: '16px' }}>Verificação em Análise</span>}
                        description="Seus documentos foram enviados e estão sendo revisados pela nossa equipe. Isso geralmente leva de 24 a 48 horas úteis."
                        type="info"
                        showIcon
                        icon={<ClockCircleOutlined style={{ fontSize: '24px' }} />}
                        className="rounded-2xl"
                        style={{ padding: '20px', backgroundColor: '#e6f4ff', border: '1px solid #91caff', marginBottom: '32px' }}
                    />
                );
            case 'rejeitado':
                return (
                    <Alert
                        message={<span style={{ fontWeight: 700, fontSize: '16px' }}>Verificação Rejeitada</span>}
                        description={
                            <div>
                                <Paragraph>Seus documentos foram rejeitados. Por favor, revise as observações abaixo e envie novamente:</Paragraph>
                                <div style={{ padding: '12px', backgroundColor: '#fff2f0', borderRadius: '10px', border: '1px solid #ffccc7' }}>
                                    <Text strong style={{ color: '#cf1322' }}>{status.motivo_rejeicao}</Text>
                                </div>
                            </div>
                        }
                        type="error"
                        showIcon
                        icon={<CloseCircleOutlined style={{ fontSize: '24px' }} />}
                        className="rounded-2xl"
                        style={{ padding: '20px', marginBottom: '32px' }}
                    />
                );
            case 'nao_enviado':
            default:
                return (
                    <Alert
                        message={<span style={{ fontWeight: 700, fontSize: '16px' }}>Ação Necessária: Verificação de Conta</span>}
                        description="Para começar a fornecer serviços, você precisa enviar seus documentos de legitimidade."
                        type="warning"
                        showIcon
                        className="rounded-2xl"
                        style={{ padding: '20px', backgroundColor: '#fffbe6', border: '1px solid #ffe58f', marginBottom: '32px' }}
                    />
                );
        }
    };

    const renderFileUpload = (label, listKey, icon) => (
        <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '8px', 
                    background: '#f0f4ff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginRight: '12px'
                }}>
                    {icon}
                </div>
                <Text strong style={{ fontSize: '14px', color: '#334155' }}>{label}</Text>
            </div>
            
            {(status?.[`${listKey}_path`] || status?.[listKey]) && (status?.status_verificacao === 'pendente' || status?.status_verificacao === 'aprovado') ? (
                <div style={{ 
                    padding: '24px', 
                    background: '#f0fdf4', 
                    border: '1px solid #bbf7d0', 
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{ color: '#15803d', display: 'flex', alignItems: 'center' }}>
                        <CheckCircleOutlined style={{ fontSize: '20px', marginRight: '8px' }} />
                        <Text strong style={{ color: '#15803d' }}>Documento Enviado</Text>
                    </div>
                    <Button 
                        type="link" 
                        icon={<EyeOutlined />} 
                        href={`${STORAGE_BASE_URL}/${status[`${listKey}_path`] || status[listKey]}`} 
                        target="_blank"
                        style={{ color: '#16a34a', fontWeight: 600 }}
                    >
                        Ver Arquivo Enviado
                    </Button>
                </div>
            ) : (
                <Upload
                multiple={false}
                fileList={fileList[listKey]}
                onChange={({ fileList: newList }) => setFileList(prev => ({ ...prev, [listKey]: newList.slice(-1) }))}
                beforeUpload={() => false}
                showUploadList={false}
                disabled={status?.status_verificacao === 'pendente' || status?.status_verificacao === 'aprovado'}
                style={{ width: '100%', display: 'block' }}
            >
                <div style={{ 
                    background: '#f8fafc', 
                    border: '2px dashed #e2e8f0', 
                    borderRadius: '16px', 
                    padding: '32px 24px',
                    textAlign: 'center',
                    transition: 'all 0.3s',
                    cursor: (status?.status_verificacao === 'pendente' || status?.status_verificacao === 'aprovado') ? 'not-allowed' : 'pointer',
                    width: '100%'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#60a5fa'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                    <div style={{ marginBottom: '16px' }}>
                        {fileList[listKey].length > 0 ? (
                            <div style={{ color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CheckCircleOutlined style={{ marginRight: '8px', fontSize: '18px' }} />
                                <Text strong style={{ color: '#059669' }}>{fileList[listKey][0].name}</Text>
                            </div>
                        ) : (
                            <>
                                <CloudUploadOutlined style={{ fontSize: '32px', color: '#94a3b8', marginBottom: '12px' }} className="group-hover:color-blue-500" />
                                <div>
                                    <Text strong style={{ display: 'block' }}>Selecionar arquivo</Text>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>Clique para procurar no seu computador</Text>
                                </div>
                            </>
                        )}
                    </div>
                    <Button 
                        icon={<SearchOutlined />} 
                        style={{ borderRadius: '10px', height: '36px', fontWeight: 600, marginTop: '8px' }}
                        disabled={status?.status_verificacao === 'pendente' || status?.status_verificacao === 'aprovado'}
                    >
                        Procurar Arquivo
                    </Button>
                </div>
            </Upload>
            )}
        </div>
    );

    if (status?.status_verificacao === 'aprovado') {
        return (
            <div className="p-8">
                <Result
                    status="success"
                    title={<span style={{ fontWeight: 800, fontSize: '28px' }}>Sua Conta está Totalmente Verificada!</span>}
                    subTitle={<span style={{ fontSize: '16px' }}>Você já pode gerenciar seguros, apólices e atender seus clientes sem restrições.</span>}
                    extra={[
                        <Button type="primary" key="console" size="large" onClick={() => window.location.href = '/seguradora/dashboard'} style={{ borderRadius: '12px', height: '50px', padding: '0 40px', fontWeight: 700 }}>
                            Ir para Dashboard
                        </Button>
                    ]}
                />
            </div>
        );
    }

    return (
        <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', fontFamily: '"Inter", sans-serif' }}>
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <Title level={1} style={{ fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Verificação de Identidade</Title>
                <Paragraph style={{ fontSize: '16px', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                    Siga os passos abaixo para autenticar sua seguradora e garantir total legitimidade no ecossistema SeguroTM.
                </Paragraph>
            </div>

            {getStatusHeader()}

            <Form 
                form={form} 
                layout="vertical" 
                onFinish={handleUpload}
            >
                <Row gutter={32}>
                    <Col xs={24} lg={16}>
                        <Card className="rounded-3xl shadow-sm border-0" style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
                            <div style={{ padding: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                                    <div style={{ background: '#2563eb', padding: '12px', borderRadius: '12px', marginRight: '16px' }}>
                                        <FileProtectOutlined style={{ color: '#fff', fontSize: '20px' }} />
                                    </div>
                                    <Title level={4} style={{ margin: 0, fontWeight: 700 }}>Documentação Legal</Title>
                                </div>

                                <Row gutter={24}>
                                    <Col span={12}>
                                        {renderFileUpload("Licença de Operação (Licença BR)", "licenca_br", <IdcardOutlined style={{ color: '#2563eb' }} />)}
                                    </Col>
                                    <Col span={12}>
                                        {renderFileUpload("Certidão NUIT (Arquivo)", "nuit_file", <FileProtectOutlined style={{ color: '#4f46e5' }} />)}
                                    </Col>
                                </Row>
                            </div>
                        </Card>

                        <Card className="rounded-3xl shadow-sm border-0" style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                            <div style={{ padding: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                                    <div style={{ background: '#059669', padding: '12px', borderRadius: '12px', marginRight: '16px' }}>
                                        <BankOutlined style={{ color: '#fff', fontSize: '20px' }} />
                                    </div>
                                    <Title level={4} style={{ margin: 0, fontWeight: 700 }}>Legitimidade Bancária</Title>
                                </div>

                                <Row gutter={20}>
                                    <Col span={24}>
                                        <Form.Item 
                                            name="nome_banco" 
                                            label={<Text strong>Nome da Instituição Bancária</Text>}
                                            rules={[{ required: true, message: 'Informe o banco' }]}
                                        >
                                            <Input 
                                                placeholder="Ex: BIM, Standard Bank, Millennium BIM" 
                                                style={{ borderRadius: '12px', height: '48px' }} 
                                                disabled={status?.status_verificacao === 'pendente' || status?.status_verificacao === 'aprovado'}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item 
                                            name="numero_conta" 
                                            label={<Text strong>Número da Conta / IBAN</Text>} 
                                            rules={[{ required: true, message: 'Informe a conta' }]}
                                        >
                                            <Input 
                                                placeholder="0000 0000 0000..." 
                                                style={{ borderRadius: '12px', height: '48px' }} 
                                                disabled={status?.status_verificacao === 'pendente' || status?.status_verificacao === 'aprovado'}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item 
                                            name="titular" 
                                            label={<Text strong>Titular da Conta (Nome da Entidade)</Text>} 
                                            rules={[{ required: true, message: 'Informe o titular' }]}
                                        >
                                            <Input 
                                                placeholder="Razão Social Completa" 
                                                style={{ borderRadius: '12px', height: '48px' }} 
                                                disabled={status?.status_verificacao === 'pendente' || status?.status_verificacao === 'aprovado'}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        {renderFileUpload("Comprovativo de IBAN / Documento Bancário", "bank_details_file", <CloudUploadOutlined style={{ color: '#059669' }} />)}
                                    </Col>
                                </Row>

                                <Divider style={{ margin: '32px 0' }} />

                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button 
                                        type="primary" 
                                        icon={<CloudUploadOutlined />} 
                                        size="large" 
                                        htmlType="submit"
                                        loading={loading}
                                        disabled={status?.status_verificacao === 'pendente' || status?.status_verificacao === 'aprovado'}
                                        style={{ 
                                            borderRadius: '14px', 
                                            height: '56px', 
                                            padding: '0 48px', 
                                            fontWeight: 700,
                                            fontSize: '16px',
                                            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        Submeter Documentação
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                        <div style={{ position: 'sticky', top: '32px' }}>
                            <Card className="rounded-3xl border-0 shadow-sm" style={{ background: '#f1f5f9', marginBottom: '24px' }}>
                                <Title level={4} style={{ fontWeight: 800 }}>Por que verificar?</Title>
                                <Paragraph style={{ color: '#475569', fontSize: '13px' }}>
                                    A verificação é obrigatória para garantir a segurança jurídica das apólices emitidas e a proteção dos clientes.
                                </Paragraph>
                                
                                <Space direction="vertical" style={{ width: '100%', marginTop: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div style={{ background: '#fff', padding: '8px', borderRadius: '10px', marginRight: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                            <CheckCircleOutlined style={{ color: '#2563eb' }} />
                                        </div>
                                        <div>
                                            <Text strong style={{ fontSize: '14px' }}>Habilitação de Serviços</Text>
                                            <Paragraph style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Crie novos seguros e atenda clientes.</Paragraph>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div style={{ background: '#fff', padding: '8px', borderRadius: '10px', marginRight: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                            <CheckCircleOutlined style={{ color: '#2563eb' }} />
                                        </div>
                                        <div>
                                            <Text strong style={{ fontSize: '14px' }}>Selo de Confiança</Text>
                                            <Paragraph style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Sua empresa ganha destaque como entidade verificada.</Paragraph>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                        <div style={{ background: '#fff', padding: '8px', borderRadius: '10px', marginRight: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                            <CheckCircleOutlined style={{ color: '#2563eb' }} />
                                        </div>
                                        <div>
                                            <Text strong style={{ fontSize: '14px' }}>Recebíveis Diretos</Text>
                                            <Paragraph style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Dados bancários validados para repasse de prémios.</Paragraph>
                                        </div>
                                    </div>
                                </Space>
                            </Card>

                            <div style={{ 
                                padding: '24px', 
                                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
                                borderRadius: '24px',
                                color: '#fff',
                                boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)'
                            }}>
                                <Space align="start">
                                    <ClockCircleOutlined style={{ fontSize: '20px', marginTop: '4px' }} />
                                    <div>
                                        <Text style={{ color: '#fff', fontWeight: 600, display: 'block' }}>Análise Expedita</Text>
                                        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Nossa equipe de governança entrará em contato em até 48h úteis.</Text>
                                    </div>
                                </Space>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default VerificacaoConta;
