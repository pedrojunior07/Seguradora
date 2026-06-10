import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Typography, Card, message, Tooltip } from 'antd';
import { ReloadOutlined, StopOutlined, CheckCircleOutlined, AuditOutlined, EyeOutlined, CloseCircleOutlined, IdcardOutlined, FileProtectOutlined, BankOutlined } from '@ant-design/icons';
import AdminService from '@services/admin.service';
import { STORAGE_BASE_URL } from '@services/api';
import { Modal, Form, Input, Radio, Typography as TypographyCore, Divider, Col, Row } from 'antd';

const { Title, Text, Paragraph } = Typography;

const SeguradorasPage = () => {
    const [loading, setLoading] = useState(false);
    const [seguradoras, setSeguradoras] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const fetchSeguradoras = async (page = 1) => {
        setLoading(true);
        try {
            const data = await AdminService.getSeguradoras({ page });
            if (data && data.data) {
                setSeguradoras(data.data);
                setPagination({
                    current: data.current_page,
                    pageSize: data.per_page,
                    total: data.total,
                });
            } else {
                // Fallback caso a API retorne formato diferente
                setSeguradoras(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            message.error('Erro ao carregar seguradoras');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const [isVerifyModalVisible, setIsVerifyModalVisible] = useState(false);
    const [selectedSeguradora, setSelectedSeguradora] = useState(null);
    const [verifyForm] = Form.useForm();
    const [verifyLoading, setVerifyLoading] = useState(false);

    const openVerifyModal = (record) => {
        setSelectedSeguradora(record);
        verifyForm.setFieldsValue({
            status_verificacao: record.status_verificacao === 'pendente' ? 'aprovado' : record.status_verificacao,
            motivo_rejeicao: record.motivo_rejeicao
        });
        setIsVerifyModalVisible(true);
    };

    const handleVerifySubmit = async (values) => {
        setVerifyLoading(true);
        try {
            await AdminService.verificarSeguradora(selectedSeguradora.id_seguradora, values);
            message.success('Status de verificação atualizado');
            setIsVerifyModalVisible(false);
            fetchSeguradoras(pagination.current);
        } catch (error) {
            message.error('Erro ao atualizar verificação');
        } finally {
            setVerifyLoading(false);
        }
    };

    useEffect(() => {
        fetchSeguradoras();
    }, []);

    const handleTableChange = (newPagination) => {
        fetchSeguradoras(newPagination.current);
    };

    const handleToggleStatus = async (record) => {
        try {
            await AdminService.toggleSeguradoraStatus(record.id_seguradora);
            message.success(`Seguradora ${record.status ? 'bloqueada' : 'ativada'} com sucesso`);
            fetchSeguradoras(pagination.current);
        } catch (error) {
            message.error('Erro ao alterar status da seguradora');
        }
    };

    const columns = [
        {
            title: 'Logo',
            dataIndex: 'logo',
            key: 'logo',
            render: (logo) => (
                logo ? <img src={logo} alt="Logo" style={{ width: 40, height: 40, objectFit: 'contain' }} /> : '-'
            ),
        },
        {
            title: 'Nome',
            dataIndex: 'nome',
            key: 'nome',
        },
        {
            title: 'Responsável',
            dataIndex: 'nome_responsavel',
            key: 'nome_responsavel',
            responsive: ['md'],
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'NUIT',
            dataIndex: 'nuit',
            key: 'nuit',
            responsive: ['lg'],
        },
        {
            title: 'Verificação',
            dataIndex: 'status_verificacao',
            key: 'status_verificacao',
            render: (status, record) => {
                let color = 'default';
                let text = 'NÃO ENVIADO';
                
                if (status === 'aprovado') { color = 'success'; text = 'VERIFICADO'; }
                else if (status === 'pendente') { color = 'processing'; text = 'PENDENTE'; }
                else if (status === 'rejeitado') { color = 'error'; text = 'REJEITADO'; }

                return (
                    <Space>
                        <Tag color={color}>{text}</Tag>
                        <Tooltip title="Analisar Documentos">
                            <Button 
                                size="small" 
                                type="text" 
                                icon={<AuditOutlined />} 
                                onClick={() => openVerifyModal(record)}
                            />
                        </Tooltip>
                    </Space>
                );
            }
        },
        {
            title: 'Status Conta',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status ? 'green' : 'red'}>
                    {status ? 'ATIVO' : 'BLOQUEADO'}
                </Tag>
            ),
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title={record.status ? "Bloquear Acesso" : "Desbloquear Acesso"}>
                        <Button
                            type={record.status ? 'primary' : 'default'}
                            danger={record.status}
                            icon={record.status ? <StopOutlined /> : <CheckCircleOutlined />}
                            onClick={() => handleToggleStatus(record)}
                        >
                            {record.status ? 'Bloquear' : 'Ativar'}
                        </Button>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="page-container">
            <div className="page-header-row">
                <Title level={2}>Gestão de Seguradoras</Title>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchSeguradoras(pagination.current)}
                >
                    Atualizar
                </Button>
            </div>

            <Card variant="borderless" className="shadow-sm">
                <Table
                    columns={columns}
                    dataSource={seguradoras}
                    rowKey="id_seguradora"
                    pagination={pagination}
                    loading={loading}
                    onChange={handleTableChange}
                />
            </Card>

            {/* Modal de Verificação */}
            <Modal
                title={`Verificação de Legitimidade: ${selectedSeguradora?.nome}`}
                open={isVerifyModalVisible}
                onCancel={() => setIsVerifyModalVisible(false)}
                onOk={() => verifyForm.submit()}
                confirmLoading={verifyLoading}
                width={700}
                okText="Salvar Decisão"
                cancelText="Cancelar"
            >
                <div style={{ marginBottom: 24 }}>
                    <Title level={5}>Documentos Enviados:</Title>
                    <Space orientation="vertical" style={{ width: '100%', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
                            <Text><IdcardOutlined /> Licença de Operação (Licença BR)</Text>
                            {selectedSeguradora?.licenca_br_path ? (
                                <Button type="link" icon={<EyeOutlined />} href={`${STORAGE_BASE_URL}/${selectedSeguradora.licenca_br_path}`} target="_blank">Ver Arquivo</Button>
                            ) : <Text type="secondary">Não enviado</Text>}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
                            <Text><FileProtectOutlined /> Certidão NUIT</Text>
                            {selectedSeguradora?.nuit_file_path ? (
                                <Button type="link" icon={<EyeOutlined />} href={`${STORAGE_BASE_URL}/${selectedSeguradora.nuit_file_path}`} target="_blank">Ver Arquivo</Button>
                            ) : <Text type="secondary">Não enviado</Text>}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
                            <Text><BankOutlined /> Comprovativo Bancário</Text>
                            {selectedSeguradora?.bank_details_file_path ? (
                                <Button type="link" icon={<EyeOutlined />} href={`${STORAGE_BASE_URL}/${selectedSeguradora.bank_details_file_path}`} target="_blank">Ver Arquivo</Button>
                            ) : <Text type="secondary">Não enviado</Text>}
                        </div>

                        {selectedSeguradora?.detalhes_bancarios && selectedSeguradora.detalhes_bancarios.length > 0 && (
                            <div style={{ padding: '16px', background: '#e6f7ff', border: '1px dashed #91d5ff', borderRadius: '12px', marginTop: '8px' }}>
                                <Title level={5} style={{ fontSize: '14px', marginBottom: '12px' }}>Dados Bancários para Repasse:</Title>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Text type="secondary" size="small" style={{ display: 'block' }}>Banco:</Text>
                                        <Text strong>{selectedSeguradora.detalhes_bancarios[0].nome_banco}</Text>
                                    </Col>
                                    <Col span={12}>
                                        <Text type="secondary" size="small" style={{ display: 'block' }}>Conta / IBAN:</Text>
                                        <Text strong>{selectedSeguradora.detalhes_bancarios[0].numero_conta}</Text>
                                    </Col>
                                    <Col span={24} style={{ marginTop: '12px' }}>
                                        <Text type="secondary" size="small" style={{ display: 'block' }}>Titular:</Text>
                                        <Text strong>{selectedSeguradora.detalhes_bancarios[0].titular}</Text>
                                    </Col>
                                </Row>
                            </div>
                        )}
                    </Space>
                </div>

                <Divider />

                <Form
                    form={verifyForm}
                    layout="vertical"
                    onFinish={handleVerifySubmit}
                    initialValues={{ status_verificacao: 'aprovado' }}
                >
                    <Form.Item
                        name="status_verificacao"
                        label="Decisão de Verificação"
                        rules={[{ required: true }]}
                    >
                        <Radio.Group buttonStyle="solid">
                            <Radio.Button value="aprovado" style={{ borderColor: '#52c41a', color: 'green' }}>
                                <CheckCircleOutlined /> Aprovar Legitimidade
                            </Radio.Button>
                            <Radio.Button value="rejeitado" style={{ borderColor: '#ff4d4f', color: 'red' }}>
                                <CloseCircleOutlined /> Rejeitar Documentação
                            </Radio.Button>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => prevValues.status_verificacao !== currentValues.status_verificacao}
                    >
                        {({ getFieldValue }) => 
                            getFieldValue('status_verificacao') === 'rejeitado' ? (
                                <Form.Item
                                    name="motivo_rejeicao"
                                    label="Motivo da Rejeição"
                                    rules={[{ required: true, message: 'Por favor, informe o motivo da rejeição' }]}
                                >
                                    <Input.TextArea rows={4} placeholder="Descreva os problemas encontrados nos documentos..." />
                                </Form.Item>
                            ) : null
                        }
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SeguradorasPage;
