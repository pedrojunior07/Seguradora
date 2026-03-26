import React, { useState } from 'react';
import { Modal, Form, Input, Button, Typography, Space, message, Divider, Card, Spin } from 'antd';
import { MobileOutlined, LoadingOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import api from '../../../services/api';

const { Title, Text, Paragraph } = Typography;

const MpesaPaymentModal = ({ visible, onCancel, pagamento, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('entry'); // 'entry', 'processing', 'success'
    const [form] = Form.useForm();

    const handlePayment = async (values) => {
        setLoading(true);
        setStep('processing');

        try {
            // Simulando um tempo de espera para o 'prompt USSD' do utilizador
            await new Promise(resolve => setTimeout(resolve, 3000));

            const response = await api.post(`/cliente/pagamentos/${pagamento.id_pagamento}/mpesa`, {
                numero_telefone: values.numero_telefone
            });

            setStep('success');
            message.success('Pagamento confirmado via M-Pesa!');

            // Esperar um pouco para mostrar o sucesso antes de fechar/redirigir
            setTimeout(() => {
                if (onSuccess) onSuccess(response.data);
            }, 2000);

        } catch (error) {
            console.error(error);
            setStep('entry');
            message.error(error.response?.data?.message || 'Erro ao processar pagamento M-Pesa');
        } finally {
            setLoading(false);
        }
    };

    const resetModal = () => {
        setStep('entry');
        form.resetFields();
    };

    return (
        <Modal
            title={
                <Space>
                    <MobileOutlined style={{ color: '#e60000' }} />
                    <span>Pagamento via M-Pesa</span>
                </Space>
            }
            open={visible}
            onCancel={() => {
                if (step !== 'processing') {
                    onCancel();
                    resetModal();
                }
            }}
            footer={null}
            width={400}
            centered
        >
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
                {step === 'entry' && (
                    <>
                        <div style={{ marginBottom: 20 }}>
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/M-Pesa_logo.png/640px-M-Pesa_logo.png"
                                alt="M-Pesa"
                                style={{ height: 50, marginBottom: 16 }}
                            />
                            <Title level={4} style={{ margin: 0 }}>Confirmar Pagamento</Title>
                            <Text type="secondary">O valor de <b>{new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(pagamento?.valor_parcela)}</b> será debitado da sua conta.</Text>
                        </div>

                        <Form form={form} layout="vertical" onFinish={handlePayment}>
                            <Form.Item
                                name="numero_telefone"
                                label="Número M-Pesa (Vodacom)"
                                rules={[
                                    { required: true, message: 'Informe o número de telefone' },
                                    { pattern: /^(84|85)\d{7}$/, message: 'Número inválido. Use 84 ou 85 seguido de 7 dígitos.' }
                                ]}
                            >
                                <Input
                                    prefix={<MobileOutlined />}
                                    placeholder="Ex: 841234567"
                                    size="large"
                                    maxLength={9}
                                />
                            </Form.Item>

                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                                style={{ background: '#e60000', borderColor: '#e60000', height: 50, marginTop: 10 }}
                            >
                                PAGAR AGORA
                            </Button>
                        </Form>

                        <div style={{ marginTop: 24, padding: '12px', background: '#fff7e6', borderRadius: '8px', border: '1px solid #ffe7ba' }}>
                            <Space align="start">
                                <InfoCircleOutlined style={{ color: '#fa8c16' }} />
                                <Text size="small" type="secondary" style={{ textAlign: 'left', display: 'block' }}>
                                    Após clicar em pagar, verifique o seu telemóvel para introduzir o seu PIN e confirmar a transação.
                                </Text>
                            </Space>
                        </div>
                    </>
                )}

                {step === 'processing' && (
                    <div style={{ padding: '40px 0' }}>
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 64, color: '#e60000' }} spin />} />
                        <Title level={4} style={{ marginTop: 24 }}>Aguardando Confirmação...</Title>
                        <Paragraph>
                            Enviamos um pedido para o seu telemóvel.<br />
                            <b>Por favor, introduza o seu PIN do M-Pesa.</b>
                        </Paragraph>
                    </div>
                )}

                {step === 'success' && (
                    <div style={{ padding: '40px 0' }}>
                        <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />
                        <Title level={3} style={{ marginTop: 24, color: '#52c41a' }}>Sucesso!</Title>
                        <Paragraph>
                            O seu pagamento foi confirmado e a sua apólice já está ativa.
                        </Paragraph>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default MpesaPaymentModal;
