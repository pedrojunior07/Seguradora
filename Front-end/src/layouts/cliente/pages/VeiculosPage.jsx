import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Typography, Modal, Space, Tag, message } from 'antd';
import { PlusOutlined, CarOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../../services/api';
import FormularioVeiculo from '../Components/FormularioVeiculo';
import ClienteLayout from "../Components/layouts/ClienteLayout";

const { Title } = Typography;

const VeiculosPage = () => {
    const [veiculos, setVeiculos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingVeiculo, setEditingVeiculo] = useState(null);

    const fetchVeiculos = async () => {
        setLoading(true);
        try {
            const response = await api.get('/cliente/veiculos');
            console.log('Veiculos response:', response.data);
            const data = response.data?.data || response.data; // Fallback in case structure changes
            setVeiculos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            message.error('Erro ao carregar veículos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVeiculos();
    }, []);

    const handleAdicionar = () => {
        setEditingVeiculo(null);
        setModalVisible(true);
    };

    const handleEditar = (veiculo) => {
        setEditingVeiculo(veiculo);
        setModalVisible(true);
    };

    const handleDeletar = async (id) => {
        try {
            await api.delete(`/cliente/veiculos/${id}`);
            message.success('Veículo removido com sucesso');
            fetchVeiculos();
        } catch (error) {
            message.error('Erro ao remover veículo');
        }
    };

    const handleSuccess = () => {
        setModalVisible(false);
        fetchVeiculos();
    };

    const columns = [
        {
            title: 'Marca/Modelo',
            key: 'veiculo',
            render: (_, record) => (
                <Space>
                    <CarOutlined />
                    {record.marca} {record.modelo} ({record.ano_fabrico})
                </Space>
            ),
        },
        { title: 'Matrícula', dataIndex: 'matricula', key: 'matricula' },
        { title: 'Cor', dataIndex: 'cor', key: 'cor' },
        {
            title: 'Kilometragem',
            dataIndex: 'quilometragem_registrada',
            key: 'km',
            render: (km) => km ? `${km} km` : '-'
        },
        {
            title: 'Ações',
            key: 'acoes',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEditar(record)} />
                    <Button danger icon={<DeleteOutlined />} onClick={() => Modal.confirm({
                        title: 'Confirmar exclusão',
                        content: 'Tem certeza que deseja remover este veículo?',
                        onOk: () => handleDeletar(record.id_veiculo)
                    })} />
                </Space>
            ),
        },
    ];

    return (
        <ClienteLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <Title level={2}><CarOutlined /> Meus Veículos</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdicionar}>
                    Adicionar Veículo
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={Array.isArray(veiculos) ? veiculos : []}
                    rowKey="id_veiculo"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={editingVeiculo ? `Editar ${editingVeiculo.marca} ${editingVeiculo.modelo}` : 'Novo Veículo'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={800}

            >
                <FormularioVeiculo
                    veiculo={editingVeiculo}
                    onSuccess={handleSuccess}
                    onCancel={() => setModalVisible(false)}
                />
            </Modal>
        </ClienteLayout>
    );
};

export default VeiculosPage;
