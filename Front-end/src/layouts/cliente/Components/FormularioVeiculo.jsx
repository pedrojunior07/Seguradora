import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, Select, Divider, Row, Col, message, Card, Space } from 'antd';
import { UploadOutlined, SaveOutlined } from '@ant-design/icons';
import api from '../../../services/api';

const { Option } = Select;
const { TextArea } = Input;

const FormularioVeiculo = ({ veiculo, onSuccess, onCancel }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState({});

    useEffect(() => {
        if (veiculo) {
            const values = { ...veiculo };
            const photoFields = [
                'foto_pneus', 'foto_vidros', 'foto_cadeiras', 'foto_bagageira',
                'foto_eletronicos', 'foto_acessorios', 'foto_frente',
                'foto_traseira', 'foto_lado_esquerdo', 'foto_lado_direito'
            ];

            // Base storage URL (assuming Laravel standard storage link)
            // If we have an env variable for storage URL we should use it, otherwise derive from API base
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
            const storageBase = apiBase.replace('/api', '/storage');

            photoFields.forEach(field => {
                if (values[field] && typeof values[field] === 'string') {
                    values[field] = [{
                        uid: field,
                        name: 'Foto Atual',
                        status: 'done',
                        url: `${storageBase}/${values[field]}`,
                    }];
                } else {
                    // Ensure undefined doesn't become null if checking
                }
            });

            form.setFieldsValue(values);
        } else {
            form.resetFields();
        }
    }, [veiculo, form]);

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    const handleUploadChange = (info, field) => {
        setFileList(prev => ({ ...prev, [field]: info.fileList }));
    };

    const onFinish = async (values) => {
        setLoading(true);
        const formData = new FormData();

        // Campos de texto e select
        Object.keys(values).forEach(key => {
            if (!key.startsWith('foto_') && values[key] !== undefined && values[key] !== null) {
                formData.append(key, values[key]);
            }
        });

        // Campos de arquivo
        const photoFields = [
            'foto_pneus', 'foto_vidros', 'foto_cadeiras', 'foto_bagageira',
            'foto_eletronicos', 'foto_acessorios', 'foto_frente',
            'foto_traseira', 'foto_lado_esquerdo', 'foto_lado_direito'
        ];

        photoFields.forEach(field => {
            if (values[field] && values[field][0]?.originFileObj) {
                formData.append(field, values[field][0].originFileObj);
            }
        });

        try {
            if (veiculo) {

                await api.post(`/cliente/veiculos/${veiculo.id_veiculo}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                message.success('Veículo atualizado com sucesso!');
            } else {
                await api.post('/cliente/veiculos', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                message.success('Veículo cadastrado com sucesso!');
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            message.error('Erro ao salvar veículo. Verifique os dados.');
        } finally {
            setLoading(false);
        }
    };

    const uploadProps = {
        beforeUpload: () => false, // Impede upload automático
        maxCount: 1,
        listType: 'picture'
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ tipo_veiculo: 'ligeiro' }}
        >
            <Divider orientation="left">Dados Básicos</Divider>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="marca" label="Marca" rules={[{ required: true }]}>
                        <Input placeholder="Ex: Toyota" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="modelo" label="Modelo" rules={[{ required: true }]}>
                        <Input placeholder="Ex: Corolla" />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item name="matricula" label="Matrícula" rules={[{ required: true }]}>
                        <Input placeholder="AA-00-AA" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="ano_fabrico" label="Ano" rules={[{ required: true }]}>
                        <Input type="number" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="cor" label="Cor" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="chassi" label="Nº Chassi/Quadro" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="valor_estimado" label="Valor Estimado" rules={[{ required: true }]}>
                        <Input type="number" step="0.01" prefix="Kz" />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="quilometragem_registrada" label="Quilometragem Atual" rules={[{ required: true }]}>
                        <Input type="number" suffix="km" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="tipo_uso" label="Tipo de Uso" rules={[{ required: true }]}>
                        <Select>
                            <Option value="pessoal">Pessoal</Option>
                            <Option value="comercial">Comercial</Option>
                            <Option value="transporte">Transporte Passageiros</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Divider orientation="left">Avaliação de Estado</Divider>
            <Row gutter={16}>
                {['pneus', 'vidros', 'cadeiras', 'bagageira', 'eletronicos', 'acessorios'].map(item => (
                    <Col span={12} key={item}>
                        <Form.Item
                            name={`estado_${item}`}
                            label={`Estado ${item.charAt(0).toUpperCase() + item.slice(1)}`}
                        >
                            <Select allowClear>
                                <Option value="bom">Bom</Option>
                                <Option value="regular">Regular</Option>
                                <Option value="mau">Mau</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                ))}
            </Row>

            <Divider orientation="left">Fotos do Veículo</Divider>
            <p style={{ color: '#888', marginBottom: 16 }}>Carregue fotos claras de todos os ângulos e detalhes.</p>

            <Row gutter={24}>
                {['frente', 'traseira', 'lado_esquerdo', 'lado_direito'].map(field => (
                    <Col span={6} key={field}>
                        <Form.Item
                            name={`foto_${field}`}
                            label={field.replace('_', ' ').toUpperCase()}
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                        >
                            <Upload {...uploadProps}>
                                <Button icon={<UploadOutlined />}>Foto</Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                ))}
            </Row>

            <Divider orientation="left">Fotos de Detalhes</Divider>
            <Row gutter={24}>
                {['pneus', 'vidros', 'cadeiras', 'bagageira', 'eletronicos', 'acessorios'].map(field => (
                    <Col span={8} key={field}>
                        <Form.Item
                            name={`foto_${field}`}
                            label={field.toUpperCase()}
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                        >
                            <Upload {...uploadProps}>
                                <Button icon={<UploadOutlined />}>Foto</Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                ))}
            </Row>

            <Divider />
            <div style={{ textAlign: 'right' }}>
                <Space>
                    <Button onClick={onCancel}>Cancelar</Button>
                    <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                        Salvar Veículo
                    </Button>
                </Space>
            </div>
        </Form>
    );
};

export default FormularioVeiculo;
