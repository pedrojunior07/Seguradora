import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Typography, Card, message, Tooltip, Modal, Form, Input, Radio, Divider, Row, Col } from 'antd';
import { 
    ReloadOutlined, 
    StopOutlined, 
    CheckCircleOutlined, 
    AuditOutlined, 
    EyeOutlined, 
    IdcardOutlined,
    FileProtectOutlined,
    BankOutlined
} from '@ant-design/icons';
import { STORAGE_BASE_URL } from '@services/api';
import AdminService from '@services/admin.service';

const { Title, Text } = Typography;

const AdminCorretorasPage = () => {
    const [loading, setLoading] = useState(false);
    const [corretoras, setCorretoras] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 15,
        total: 0,
    });

    const fetchCorretoras = async (page = 1) => {
        setLoading(true);
        try {
            const data = await AdminService.getCorretoras({ page });
            setCorretoras(data.data);
            setPagination({
                ...pagination,
                current: data.current_page,
                total: data.total,
            });
        } catch (error) {
            message.error('Erro ao carregar corretoras');
        } finally {
            setLoading(false);
        }
    };

    const [isVerifyModalVisible, setIsVerifyModalVisible] = useState(false);
    const [selectedCorretora, setSelectedCorretora] = useState(null);
    const [verifyForm] = Form.useForm();
    const [verifyLoading, setVerifyLoading] = useState(false);

    const openVerifyModal = (record) => {
        setSelectedCorretora(record);
        verifyForm.setFieldsValue({
            status_verificacao: record.status_verificacao === 'pendente' ? 'aprovado' : record.status_verificacao,
            motivo_rejeicao: record.motivo_rejeicao
        });
        setIsVerifyModalVisible(true);
    };

    const handleVerifySubmit = async (values) => {
        if (!selectedCorretora?.id_corretora) {
            message.error('Corretora não identificada. Feche e tente novamente.');
            return;
        }
        setVerifyLoading(true);
        try {
            await AdminService.verificarCorretora(selectedCorretora.id_corretora, values);
            message.success(
                values.status_verificacao === 'aprovado'
                    ? 'Corretora aprovada com sucesso!'
                    : 'Corretora rejeitada. A corretora foi notificada.'
            );
            setIsVerifyModalVisible(false);
            fetchCorretoras(pagination.current);
        } catch (error) {
            console.error('Erro verificação corretora:', error);
            message.error(error?.message || error?.data?.message || 'Erro ao atualizar verificação. Tente novamente.');
        } finally {
            setVerifyLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await AdminService.toggleCorretoraStatus(id);
            message.success('Status da corretora alterado');
            fetchCorretoras(pagination.current);
        } catch (error) {
            message.error('Erro ao alterar status');
        }
    };

    useEffect(() => {
        fetchCorretoras();
    }, []);

    const columns = [
        {
            title: 'Nome',
            dataIndex: 'nome',
            key: 'nome',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Responsável',
            dataIndex: 'nome_responsavel',
            key: 'nome_responsavel',
        },
        {
            title: 'Email/Telefone',
            key: 'contact',
            render: (_, record) => (
                <Space orientation="vertical" size={0}>
                    <Text size="small">{record.email}</Text>
                    <Text type="secondary" size="small">{record.telefone1}</Text>
                </Space>
            ),
        },
        {
            title: 'Verificação',
            dataIndex: 'status_verificacao',
            key: 'status_verificacao',
            render: (status, record) => {
                let color = 'default';
                let text = 'NÃO ENVIADO';
                
                if (status === 'aprovado') { color = 'success'; text = 'VERIFICADA'; }
                else if (status === 'pendente') { color = 'processing'; text = 'PENDENTE'; }
                else if (status === 'rejeitado') { color = 'error'; text = 'REJEITADA'; }

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
                <Space size="middle">
                    <Tooltip title={record.status ? 'Bloquear Corretora' : 'Ativar Corretora'}>
                        <Button 
                            type="text" 
                            danger={record.status}
                            icon={record.status ? <StopOutlined /> : <CheckCircleOutlined />} 
                            onClick={() => handleToggleStatus(record.id_corretora)}
                            style={{ color: record.status ? '#ff4d4f' : '#52c41a' }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="page-container">
            <Card variant="borderless" className="shadow-sm rounded-2xl">
                <div className="page-header-row">
                    <Title level={3} style={{ margin: 0 }}>Gestão de Corretoras</Title>
                    <Button 
                        icon={<ReloadOutlined />} 
                        onClick={() => fetchCorretoras(pagination.current)}
                        loading={loading}
                    >
                        Atualizar
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={corretoras}
                    rowKey="id_corretora"
                    pagination={{
                        ...pagination,
                        onChange: (page) => fetchCorretoras(page),
                    }}
                    loading={loading}
                />
            </Card>

            {/* Modal de Verificação */}
            <Modal
                title={`Verificação de Corretora: ${selectedCorretora?.nome}`}
                open={isVerifyModalVisible}
                onCancel={() => setIsVerifyModalVisible(false)}
                onOk={() => verifyForm.submit()}
                confirmLoading={verifyLoading}
                width={700}
                okText="Salvar Decisão"
                cancelText="Cancelar"
                className="rounded-2xl overflow-hidden"
            >
                <div style={{ marginBottom: 24, padding: '16px', background: '#f8fafc', borderRadius: '16px' }}>
                    <Title level={5}>Análise de Documentos:</Title>
                    <Space orientation="vertical" style={{ width: '100%' }} size="middle">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <Text><IdcardOutlined style={{ color: '#2563eb', marginRight: '8px' }} /> Licença de Operação</Text>
                            {selectedCorretora?.licenca_br_path ? (
                                <Button type="link" icon={<EyeOutlined />} href={`${STORAGE_BASE_URL}/${selectedCorretora.licenca_br_path}`} target="_blank">Ver Arquivo</Button>
                            ) : <Text type="secondary">Não enviado</Text>}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <Text><FileProtectOutlined style={{ color: '#4f46e5', marginRight: '8px' }} /> Certidão NUIT</Text>
                            {selectedCorretora?.nuit_file_path ? (
                                <Button type="link" icon={<EyeOutlined />} href={`${STORAGE_BASE_URL}/${selectedCorretora.nuit_file_path}`} target="_blank">Ver Arquivo</Button>
                            ) : <Text type="secondary">Não enviado</Text>}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <Text><BankOutlined style={{ color: '#059669', marginRight: '8px' }} /> Comprovativo Bancário</Text>
                            {selectedCorretora?.bank_details_file_path ? (
                                <Button type="link" icon={<EyeOutlined />} href={`${STORAGE_BASE_URL}/${selectedCorretora.bank_details_file_path}`} target="_blank">Ver Arquivo</Button>
                            ) : <Text type="secondary">Não enviado</Text>}
                        </div>

                        {selectedCorretora?.detalhes_bancarios && selectedCorretora.detalhes_bancarios.length > 0 && (
                            <div style={{ padding: '20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', marginTop: '8px' }}>
                                <Title level={5} style={{ fontSize: '15px', marginBottom: '16px', color: '#0f172a' }}>Dados Bancários para Comissões:</Title>
                                <Row gutter={24}>
                                    <Col span={12}>
                                        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Banco:</Text>
                                        <Text strong style={{ fontSize: '14px' }}>{selectedCorretora.detalhes_bancarios[0].nome_banco}</Text>
                                    </Col>
                                    <Col span={12}>
                                        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>IBAN / Conta:</Text>
                                        <Text strong style={{ fontSize: '14px' }}>{selectedCorretora.detalhes_bancarios[0].numero_conta}</Text>
                                    </Col>
                                    <Col span={24} style={{ marginTop: '16px' }}>
                                        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Titular:</Text>
                                        <Text strong style={{ fontSize: '14px' }}>{selectedCorretora.detalhes_bancarios[0].titular}</Text>
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
                >
                    <Form.Item
                        name="status_verificacao"
                        label="Decisão de Verificação"
                        rules={[{ required: true }]}
                    >
                        <Radio.Group buttonStyle="solid">
                            <Radio.Button value="aprovado">Aprovar Legitimidade</Radio.Button>
                            <Radio.Button value="rejeitado">Rejeitar Documentos</Radio.Button>
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
                                    rules={[{ required: true, message: 'Informe o motivo para que a corretora possa corrigir.' }]}
                                >
                                    <Input.TextArea rows={4} placeholder="Ex: A licença enviada está expirada..." />
                                </Form.Item>
                            ) : null
                        }
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminCorretorasPage;
