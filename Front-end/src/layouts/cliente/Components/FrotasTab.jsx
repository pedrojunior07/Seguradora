import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Typography, Modal, Space, Tag, message, Form, Input, Upload, Divider, Spin } from 'antd';
import {
    PlusOutlined,
    ApartmentOutlined,
    ImportOutlined,
    FileExcelOutlined,
    LoadingOutlined,
    DownloadOutlined,
    QuestionCircleOutlined,
    DeleteOutlined,
    FileProtectOutlined,
    EyeOutlined,
    EditOutlined
} from '@ant-design/icons';
import api from '../../../services/api';
import ContratarSeguroFrotaModal from './ContratarSeguroFrotaModal';
import VerVeiculosFrotaModal from './VerVeiculosFrotaModal';

const { Title, Text, Paragraph } = Typography;

const FrotasTab = ({ entidade, onImportSuccess }) => {
    const [frotas, setFrotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [insuranceModalVisible, setInsuranceModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedFrota, setSelectedFrota] = useState(null);
    const [editingFrota, setEditingFrota] = useState(null);
    const [importing, setImporting] = useState(false);
    const [form] = Form.useForm();
    const [importForm] = Form.useForm();

    const fetchFrotas = async () => {
        setLoading(true);
        try {
            const response = await api.get('/cliente/frotas');
            setFrotas(response.data?.data || []);
        } catch (error) {
            console.error(error);
            message.error('Erro ao carregar frotas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFrotas();
    }, []);

    const handleCreateFrota = async (values) => {
        try {
            if (editingFrota) {
                await api.put(`/cliente/frotas/${editingFrota.id}`, values);
                message.success('Frota atualizada com sucesso');
            } else {
                await api.post('/cliente/frotas', values);
                message.success('Frota criada com sucesso');
            }
            setModalVisible(false);
            setEditingFrota(null);
            form.resetFields();
            fetchFrotas();
        } catch (error) {
            message.error('Erro ao salvar frota');
        }
    };

    const handleDeleteFrota = async (id) => {
        try {
            await api.delete(`/cliente/frotas/${id}`);
            message.success('Frota removida com sucesso');
            fetchFrotas();
        } catch (error) {
            message.error('Erro ao remover frota');
        }
    };

    const handleImport = async (values) => {
        const { arquivo } = values;

        const fileToUpload = arquivo?.originFileObj || arquivo?.file || arquivo;

        if (!fileToUpload) {
            message.error('Por favor, selecione um arquivo válido');
            return;
        }

        const formData = new FormData();
        formData.append('arquivo', fileToUpload);

        setImporting(true);
        try {
            const response = await api.post(`/cliente/frotas/${selectedFrota.id}/importar-veiculos`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { sucesso, erros } = response.data;
            message.success(`${sucesso} veículos importados com sucesso!`);

            if (erros && erros.length > 0) {
                Modal.warning({
                    title: 'Importação com Alertas',
                    content: (
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <Paragraph>Algumas linhas falharam na validação:</Paragraph>
                            {erros.map((err, i) => (
                                <div key={i} style={{ marginBottom: '12px', padding: '8px', background: '#fff1f0', borderRadius: '4px' }}>
                                    <Text strong>Linha {err.linha}:</Text> <Text type="secondary">Matrícula: {err.matricula}</Text>
                                    <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                                        {err.erros.map((e, j) => <li key={j}><Text type="danger">{e}</Text></li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ),
                    width: 600
                });
            }

            setImportModalVisible(false);
            importForm.resetFields();
            if (onImportSuccess) onImportSuccess();
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.message || 'Erro ao importar veículos. Verifique o formato do arquivo.');
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = () => {
        const headers = "matricula,marca,modelo,ano_fabricacao,tipo_veiculo,chassi,cor,cilindrada,combustivel,numero_lugares,quilometragem,valor_base_bem,estado_veiculo,observacoes\n";
        const example = "ABC-123-MP,Toyota,Hilux,2022,Ligeiro,938475GD8392,Branco,2800cc,Diesel,5,15000,2500000,Bom,Uso executivo\n";
        const blob = new Blob([headers + example], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "modelo_importacao_frota.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        {
            title: 'Nome da Frota',
            dataIndex: 'nome_frota',
            key: 'nome_frota',
            render: (text) => <Text strong><ApartmentOutlined style={{ marginRight: 8 }} /> {text}</Text>
        },
        {
            title: 'Descrição',
            dataIndex: 'descricao',
            key: 'descricao',
            ellipsis: true
        },
        {
            title: 'Veículos',
            dataIndex: 'veiculos_count',
            key: 'veiculos_count',
            render: (count) => <Tag color="blue">{count || 0} Veículos</Tag>
        },
        {
            title: 'Ações',
            key: 'acoes',
            align: 'right',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        title="Ver Veículos"
                        onClick={() => {
                            setSelectedFrota(record);
                            setViewModalVisible(true);
                        }}
                    />
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                            setEditingFrota(record);
                            setModalVisible(true);
                            form.setFieldsValue(record);
                        }}
                    />
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => Modal.confirm({
                            title: 'Confirmar exclusão',
                            content: `Deseja realmente excluir a frota "${record.nome_frota}"? Isso não removerá os veículos do sistema.`,
                            okText: 'Sim, Excluir',
                            cancelText: 'Cancelar',
                            onOk: () => handleDeleteFrota(record.id)
                        })}
                    />
                    <Button
                        type="primary"
                        ghost
                        icon={<ImportOutlined />}
                        onClick={() => {
                            setSelectedFrota(record);
                            setImportModalVisible(true);
                        }}
                    >
                        Importar Excel
                    </Button>
                    <Button
                        type="primary"
                        icon={<FileProtectOutlined />}
                        style={{ background: '#52c41a', borderColor: '#52c41a' }}
                        onClick={() => {
                            setSelectedFrota(record);
                            setInsuranceModalVisible(true);
                        }}
                    >
                        Segurar Frota
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '16px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={4} style={{ margin: 0 }}>Gestão de Frotas</Title>
                    <Text type="secondary">Crie e gerencie agrupamentos de veículos e importe dados em massa.</Text>
                </div>
                <Space>
                    <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>
                        Baixar Modelo
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
                        Nova Frota
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={frotas}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 5 }}
                locale={{ emptyText: 'Nenhuma frota cadastrada. Comece criando uma nova frota.' }}
            />

            {/* Modal Criar/Editar Frota */}
            <Modal
                title={editingFrota ? "Editar Frota" : "Criar Nova Frota"}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingFrota(null);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText={editingFrota ? "Atualizar" : "Criar"}
                cancelText="Cancelar"
            >
                <Form form={form} layout="vertical" onFinish={handleCreateFrota}>
                    <Form.Item
                        name="nome_frota"
                        label="Nome da Frota"
                        rules={[{ required: true, message: 'Por favor, informe o nome da frota' }]}
                    >
                        <Input placeholder="Ex: Frota Norte, Executivos, etc." />
                    </Form.Item>
                    <Form.Item name="descricao" label="Descrição (Opcional)">
                        <Input.TextArea rows={3} placeholder="Breve descrição sobre o uso desta frota" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Importar Veículos */}
            <Modal
                title={
                    <Space>
                        <FileExcelOutlined style={{ color: '#52c41a' }} />
                        <span>Importar Veículos para: {selectedFrota?.nome_frota}</span>
                    </Space>
                }
                open={importModalVisible}
                onCancel={() => !importing && setImportModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setImportModalVisible(false)} disabled={importing}>
                        Cancelar
                    </Button>,
                    <Button key="submit" type="primary" loading={importing} onClick={() => importForm.submit()}>
                        Iniciar Importação
                    </Button>,
                ]}
                width={620}
            >
                <div style={{ marginBottom: 20, padding: '16px', background: '#e6f7ff', borderLeft: '4px solid #1890ff', borderRadius: '4px' }}>
                    <Title level={5}><QuestionCircleOutlined /> Instruções de Importação</Title>
                    <Paragraph>
                        1. Use o modelo oficial para garantir que todas as colunas estejam corretas.<br />
                        2. Colunas obrigatórias: matricula, marca, modelo, ano_fabricacao, tipo_veiculo, chassi, valor_base_bem.<br />
                        3. Os veículos serão registrados na frota e poderão ser segurados depois.
                    </Paragraph>
                    <Button type="primary" ghost size="small" onClick={downloadTemplate} icon={<DownloadOutlined />}>
                        Baixar modelo CSV/Excel
                    </Button>
                </div>

                <Form form={importForm} layout="vertical" onFinish={handleImport}>
                    <Form.Item
                        name="arquivo"
                        label="Arquivo de Veículos"
                        rules={[{ required: true, message: 'Por favor, selecione o arquivo' }]}
                        valuePropName="file"
                        getValueFromEvent={(e) => {
                            if (Array.isArray(e)) return e[0];
                            return e?.file || e;
                        }}
                    >
                        <Upload
                            beforeUpload={() => false}
                            maxCount={1}
                            accept=".xlsx,.xls,.csv"
                            listType="picture-card"
                            className="upload-list-inline"
                        >
                            <div style={{ padding: '8px' }}>
                                <FileExcelOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                                <div style={{ marginTop: 8 }}>Selecionar Arquivo</div>
                            </div>
                        </Upload>
                    </Form.Item>

                    {importing && (
                        <div style={{ textAlign: 'center', marginTop: 20, padding: '20px', background: '#f5f5f5', borderRadius: '8px', border: '1px dashed #d9d9d9' }}>
                            <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
                            <Title level={5} style={{ marginTop: 16 }}>Processando Importação...</Title>
                            <Paragraph type="secondary">Estamos validando os dados e registrando os veículos. Por favor, aguarde.</Paragraph>
                        </div>
                    )}
                </Form>
            </Modal>

            <VerVeiculosFrotaModal
                visible={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                frota={selectedFrota}
            />

            <ContratarSeguroFrotaModal
                visible={insuranceModalVisible}
                onCancel={() => setInsuranceModalVisible(false)}
                frota={selectedFrota}
                onSuccess={() => {
                    setInsuranceModalVisible(false);
                    message.success('Processo de contratação iniciado!');
                }}
            />
        </div>
    );
};

export default FrotasTab;
