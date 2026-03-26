import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Table, Typography, Space, Button, message, Divider, Tag, Spin, Card } from 'antd';
import { FileProtectOutlined, CarOutlined, DollarOutlined, InfoCircleOutlined } from '@ant-design/icons';
import api from '../../../services/api';
import clienteService from '../../../services/cliente.service';

const { Title, Text, Paragraph } = Typography;

const ContratarSeguroFrotaModal = ({ visible, onCancel, frota, onSuccess }) => {
    const [seguros, setSeguros] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    const [veiculos, setVeiculos] = useState([]);

    const valorTotal = veiculos.reduce((acc, v) => acc + parseFloat(v.valor_estimado || 0), 0);

    const fetchDetails = async () => {
        if (!frota) return;
        setLoading(true);
        try {
            // Buscar veículos da frota (assumindo que o backend retorna os veículos no detalhe da frota ou endpoint específico)
            const response = await api.get(`/cliente/frotas`); // No nosso caso, o index ou show deve trazer
            const frotasData = response.data?.data || [];
            const currentFrota = frotasData.find(f => f.id === frota.id);

            // Se o backend não traz veiculos no index, poderíamos precisar de:
            // const veicResp = await api.get(`/cliente/veiculos?frota_id=${frota.id}`);
            // Mas vamos assumir que o usuário quer ver os veículos que estão na frota.
            // Para simplicidade, vamos usar o record.veiculos se disponível ou buscar.

            // Simulação de busca de veículos se não vierem no record
            if (currentFrota && currentFrota.veiculos) {
                setVeiculos(currentFrota.veiculos);
            } else {
                // Fallback: carregar todos os veículos e filtrar (menos eficiente, mas garante funcionamento se o endpoint não for específico)
                const vResp = await api.get('/cliente/veiculos');
                const todosVeiculos = vResp.data?.data || [];
                const veiculosDaFrota = todosVeiculos.filter(v =>
                    v.frotas && v.frotas.some(f => f.id === frota.id)
                );
                setVeiculos(veiculosDaFrota);
            }

            // Buscar seguros disponíveis
            const sResp = await clienteService.getSegurosDisponiveis();
            const data = sResp.data || sResp;
            const segurosVeiculos = (Array.isArray(data) ? data : []).filter(s =>
                s.seguro?.categoria?.descricao?.toLowerCase().includes('veiculo') ||
                s.seguro?.categoria?.descricao?.toLowerCase().includes('auto')
            );
            setSeguros(segurosVeiculos);

        } catch (error) {
            console.error(error);
            message.error('Erro ao carregar detalhes para contratação');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible) {
            fetchDetails();
        }
    }, [visible, frota]);

    const handleFinish = async (values) => {
        if (veiculos.length === 0) {
            message.warning('Esta frota não possui veículos para segurar.');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/cliente/propostas', {
                id_seguradora_seguro: values.id_seguradora_seguro,
                valor_bem: valorTotal,
                id_bem: frota.id,
                tipo_bem: 'frota'
            });

            message.success('Proposta de seguro para frota enviada com sucesso!');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.message || 'Erro ao enviar proposta de frota');
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        {
            title: 'Veículo',
            key: 'veiculo',
            render: (text, record) => (
                <Space>
                    <CarOutlined />
                    <span>{record.marca} {record.modelo} ({record.matricula})</span>
                </Space>
            )
        },
        {
            title: 'Valor Estimado',
            dataIndex: 'valor_estimado',
            key: 'valor',
            render: (val) => new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(val)
        }
    ];

    return (
        <Modal
            title={
                <Space>
                    <FileProtectOutlined style={{ color: '#1890ff' }} />
                    <span>Contratar Seguro para Frota: {frota?.nome_frota}</span>
                </Space>
            }
            open={visible}
            onCancel={onCancel}
            onOk={() => form.submit()}
            confirmLoading={submitting}
            width={700}
            okText="Enviar Proposta"
            cancelText="Voltar"
        >
            <Spin spinning={loading}>
                <div style={{ marginBottom: 20 }}>
                    <Paragraph>
                        Você está iniciando a contratação de seguro para todos os veículos vinculados a esta frota.
                        Conforme o regime de **Contrato Único**, o prêmio total será a soma dos riscos avaliados para cada veículo individualmente.
                    </Paragraph>

                    <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f', marginBottom: 16 }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text strong><DollarOutlined /> Valor Total da Frota:</Text>
                                <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                                    {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(valorTotal)}
                                </Title>
                            </div>
                            <Tag color="green">{veiculos.length} veículos para avaliação individual</Tag>
                        </Space>
                    </Card>

                    <div style={{ marginBottom: 16, padding: '8px', background: '#e6f7ff', borderRadius: '4px' }}>
                        <Text type="secondary" size="small">
                            <InfoCircleOutlined /> Importante: A seguradora emitirá um parecer técnico por veículo, permitindo uma visão detalhada do risco da sua frota sob uma única apólice.
                        </Text>
                    </div>

                    <Title level={5} style={{ marginBottom: 12 }}>Detalhamento da Frota (Riscos Individuais)</Title>
                    <Table
                        dataSource={veiculos}
                        columns={columns}
                        rowKey="id_veiculo"
                        pagination={{ pageSize: 5 }}
                        size="small"
                        style={{ marginBottom: 24 }}
                    />

                    <Divider />

                    <Form form={form} layout="vertical" onFinish={handleFinish}>
                        <Form.Item
                            name="id_seguradora_seguro"
                            label="Escolha o Produto de Seguro"
                            rules={[{ required: true, message: 'Por favor, selecione um produto de seguro' }]}
                            extra="O mesmo produto (regras e coberturas) será aplicado a todos os veículos da frota."
                        >
                            <Select placeholder="Selecione a seguradora e o produto">
                                {seguros.map(s => (
                                    <Select.Option key={s.id} value={s.id}>
                                        {s.seguradora?.nome} - {s.seguro?.nome}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Form>

                    <div style={{ background: '#fff7e6', padding: '12px', borderRadius: '4px', borderLeft: '4px solid #ffa940' }}>
                        <Space>
                            <InfoCircleOutlined style={{ color: '#ffa940' }} />
                            <Text size="small">
                                Após o envio, a seguradora analisará a frota completa e emitirá um parecer para todos os veículos.
                            </Text>
                        </Space>
                    </div>
                </div>
            </Spin>
        </Modal>
    );
};

export default ContratarSeguroFrotaModal;
