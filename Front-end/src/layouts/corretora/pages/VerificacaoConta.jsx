import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Upload, 
  Button, 
  Alert, 
  Space, 
  message, 
  Divider, 
  Row, 
  Col,
  Form,
  Input,
  Result
} from 'antd';
import { STORAGE_BASE_URL } from '@services/api';
import { 
    CloudUploadOutlined, 
    CheckCircleOutlined, 
    SearchOutlined, 
    FileTextOutlined, 
    SafetyCertificateOutlined,
    CloseCircleOutlined,
    IdcardOutlined,
    FileProtectOutlined,
    BankOutlined,
    EyeOutlined
} from '@ant-design/icons';
import corretoraService from '@services/corretora.service';

const { Title, Text, Paragraph } = Typography;

const VerificacaoContaCorretora = () => {
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
            const data = await corretoraService.getVerificacaoStatus();
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
            await corretoraService.uploadDocumentos(formData);
            message.success('Documentos enviados com sucesso!');
            fetchStatus();
        } catch (error) {
            console.error('Erro no upload Corretora:', error);
            if (error.status === 401) {
                message.error('Sessão expirada. Por favor, faça login em outra aba para não perder seu progresso.');
            } else if (error.response?.data?.errors) {
                // Exibir cada erro de validação vindo do Laravel
                const errors = error.response.data.errors;
                Object.keys(errors).forEach(key => {
                    message.error(`${errors[key][0]}`);
                });
            } else {
                message.error(error.response?.data?.message || error.message || 'Erro ao enviar documentos. Verifique o tamanho e formato dos arquivos.');
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
                        message={<span style={{ fontWeight: 700, fontSize: '16px' }}>Corretora Verificada</span>}
                        description={<span style={{ color: '#1a2e1a' }}>Sua corretora está totalmente verificada e autorizada a emitir propostas.</span>}
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
                        message={<span style={{ fontWeight: 700, fontSize: '16px' }}>Análise em Andamento</span>}
                        description="Seus documentos foram enviados e estão sendo revisados pela governança."
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
                                <Paragraph>Ocorreram problemas com seus documentos. Por favor, revise:</Paragraph>
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
                        message={<span style={{ fontWeight: 700, fontSize: '16px' }}>Verificação de Legitimidade</span>}
                        description="Como Corretora de Seguros, sua conta precisa ser validada antes de operar."
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
                accept=".pdf,.jpg,.jpeg,.png,.webp"
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
                    title={<span style={{ fontWeight: 800, fontSize: '28px' }}>Corretora Verificada!</span>}
                    subTitle={<span style={{ fontSize: '16px' }}>Sua conta está ativa para emitir novas propostas e gerenciar clientes.</span>}
                />
            </div>
        );
    }

    return (
        <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: '"Inter", sans-serif' }}>
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <Title level={1} style={{ fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Verificação da Corretora</Title>
                <Paragraph style={{ fontSize: '16px', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                    Anexe os documentos obrigatórios para habilitar os serviços de corretagem na plataforma.
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
                                <Title level={4} style={{ marginBottom: '32px', fontWeight: 700 }}>Documentos da Empresa</Title>
                                <Row gutter={24}>
                                    <Col span={12}>
                                        {renderFileUpload("Licença Nacional", "licenca_br", <IdcardOutlined style={{ color: '#2563eb' }} />)}
                                    </Col>
                                    <Col span={12}>
                                        {renderFileUpload("Certidão NUIT", "nuit_file", <FileProtectOutlined style={{ color: '#4f46e5' }} />)}
                                    </Col>
                                </Row>
                            </div>
                        </Card>

                        <Card className="rounded-3xl shadow-sm border-0" style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                            <div style={{ padding: '32px' }}>
                                <Title level={4} style={{ marginBottom: '32px', fontWeight: 700 }}>Dados para Pagamento</Title>
                                <Row gutter={20}>
                                    <Col span={24}>
                                        <Form.Item name="nome_banco" label={<Text strong>Banco</Text>} rules={[{ required: true }]}>
                                            <Input 
                                                placeholder="Nome do Banco" 
                                                style={{ borderRadius: '12px', height: '48px' }} 
                                                disabled={status?.status_verificacao === 'pendente' || status?.status_verificacao === 'aprovado'}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="numero_conta" label={<Text strong>IBAN / Conta</Text>} rules={[{ required: true }]}>
                                            <Input 
                                                placeholder="IBAN" 
                                                style={{ borderRadius: '12px', height: '48px' }} 
                                                disabled={status?.status_verificacao === 'pendente' || status?.status_verificacao === 'aprovado'}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="titular" label={<Text strong>Titular</Text>} rules={[{ required: true }]}>
                                            <Input 
                                                placeholder="Nome Completo" 
                                                style={{ borderRadius: '12px', height: '48px' }} 
                                                disabled={status?.status_verificacao === 'pendente' || status?.status_verificacao === 'aprovado'}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        {renderFileUpload("Comprovativo Bancário", "bank_details_file", <CloudUploadOutlined style={{ color: '#059669' }} />)}
                                    </Col>
                                </Row>

                                <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
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
                                            background: '#1e293b'
                                        }}
                                    >
                                        Submeter para Análise
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card className="rounded-3xl border-0 shadow-sm" style={{ background: '#f8fafc' }}>
                            <Title level={4} style={{ fontWeight: 800 }}>Requisitos</Title>
                            <Paragraph style={{ color: '#475569', fontSize: '13px' }}>
                                Todas as corretoras parceiras devem possuir licença válida para operar no mercado moçambicano.
                            </Paragraph>
                            <Divider />
                            <Space direction="vertical">
                                <Text strong>Como funciona?</Text>
                                <Text style={{ fontSize: '13px' }}>1. Você envia os documentos.</Text>
                                <Text style={{ fontSize: '13px' }}>2. Nossa equipe valida a legitimidade.</Text>
                                <Text style={{ fontSize: '13px' }}>3. Suas funcionalidades são desbloqueadas.</Text>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default VerificacaoContaCorretora;
