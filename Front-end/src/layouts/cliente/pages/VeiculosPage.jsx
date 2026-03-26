import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Typography, Modal, Space, Tag, message, Tabs } from 'antd';
import { PlusOutlined, CarOutlined, EditOutlined, DeleteOutlined, ApartmentOutlined } from '@ant-design/icons';
import api from '../../../services/api';
import FormularioVeiculo from '../Components/FormularioVeiculo';
import ClienteLayout from "../Components/layouts/ClienteLayout";
import { useAuth } from '../../../context/AuthContext';
import FrotasTab from '../Components/FrotasTab';

const { Title, Text } = Typography;

const VeiculosPage = () => {
    const { entidade } = useAuth();
    const [veiculos, setVeiculos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingVeiculo, setEditingVeiculo] = useState(null);
    const [activeTab, setActiveTab] = useState('veiculos');

    const fetchVeiculos = async () => {
        setLoading(true);
        try {
            const response = await api.get('/cliente/veiculos?sem_frota=1');
            const data = response.data?.data || response.data;
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
            title: 'Frota',
            key: 'frota',
            render: (_, record) => {
                const frota = record.frotas?.[0];
                return frota ? <Tag color="blue">{frota.nome_frota}</Tag> : <Tag>Individual</Tag>;
            }
        },
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

    const tabItems = [
        {
            key: 'veiculos',
            label: <Space><CarOutlined /> Meus Veículos</Space>,
            children: (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, marginTop: 16 }}>
                        <Title level={4}>Lista de Veículos</Title>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdicionar}>
                            Adicionar Veículo
                        </Button>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={Array.isArray(veiculos) ? veiculos : []}
                        rowKey="id_veiculo"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 'max-content' }}
                    />
                </>
            )
        }
    ];

    // Adicionar aba de frotas apenas para clientes jurídicos
    if (entidade?.tipo_cliente === 'juridica') {
        tabItems.push({
            key: 'frotas',
            label: <Space><ApartmentOutlined /> Frotas</Space>,
            children: <FrotasTab entidade={entidade} onImportSuccess={fetchVeiculos} />
        });
    }

    return (
        <ClienteLayout>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}><CarOutlined /> Gestão Automóvel</Title>
                <Text type="secondary">Gerencie seus veículos individuais e frotas corporativas em um só lugar.</Text>
            </div>

            <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    size="large"
                />
            </Card>

            <Modal
                title={editingVeiculo ? `Editar ${editingVeiculo.marca} ${editingVeiculo.modelo}` : 'Novo Veículo'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={800}
                style={{ maxWidth: '95vw', top: 10, paddingBottom: 0 }}
                styles={{ body: { padding: '20px 0', maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' } }}

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
