import React, { useState, useEffect } from 'react';
import { Modal, Table, Typography, Space, Button, Tag, Spin, message } from 'antd';
import { CarOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../../../services/api';
import FormularioVeiculo from './FormularioVeiculo';

const { Text } = Typography;

const VerVeiculosFrotaModal = ({ visible, onCancel, frota }) => {
    const [veiculos, setVeiculos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingVeiculo, setEditingVeiculo] = useState(null);
    const [addingVeiculo, setAddingVeiculo] = useState(false);

    const fetchVeiculos = async () => {
        if (!frota) return;
        setLoading(true);
        try {
            const response = await api.get(`/cliente/frotas/${frota.id}`);
            setVeiculos(response.data?.data?.veiculos || []);
        } catch (error) {
            console.error(error);
            message.error('Erro ao carregar veículos da frota');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible) {
            fetchVeiculos();
        }
    }, [visible, frota]);

    const columns = [
        {
            title: 'Veículo',
            key: 'veiculo',
            render: (_, record) => (
                <Space>
                    <CarOutlined />
                    <Text strong>{record.marca} {record.modelo}</Text>
                </Space>
            )
        },
        { title: 'Matrícula', dataIndex: 'matricula', key: 'matricula' },
        { title: 'Ano', dataIndex: 'ano_fabrico', key: 'ano' },
        {
            title: 'Valor Estimado',
            dataIndex: 'valor_estimado',
            key: 'valor',
            render: (val) => new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(val)
        },
        {
            title: 'Ações',
            key: 'acoes',
            width: 100,
            render: (_, record) => (
                <Button
                    icon={<EditOutlined />}
                    type="link"
                    onClick={() => setEditingVeiculo(record)}
                >
                    Editar
                </Button>
            )
        }
    ];

    return (
        <>
            <Modal
                title={`Veículos na Frota: ${frota?.nome_frota}`}
                open={visible && !editingVeiculo && !addingVeiculo}
                onCancel={onCancel}
                footer={[
                    <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => setAddingVeiculo(true)}>
                        Adicionar Veículo
                    </Button>,
                    <Button key="close" onClick={onCancel}>Fechar</Button>
                ]}
                width={800}
            >
                <Spin spinning={loading}>
                    <Table
                        dataSource={veiculos}
                        columns={columns}
                        rowKey="id_veiculo"
                        pagination={{ pageSize: 10 }}
                        size="middle"
                    />
                </Spin>
            </Modal>

            <Modal
                title={`Editar Veículo: ${editingVeiculo?.matricula}`}
                open={!!editingVeiculo}
                onCancel={() => setEditingVeiculo(null)}
                footer={null}
                width={900}
            >
                <FormularioVeiculo
                    veiculo={editingVeiculo}
                    onCancel={() => setEditingVeiculo(null)}
                    onSuccess={() => {
                        setEditingVeiculo(null);
                        fetchVeiculos();
                    }}
                />
            </Modal>

            <Modal
                title={`Adicionar Veículo à Frota: ${frota?.nome_frota}`}
                open={addingVeiculo}
                onCancel={() => setAddingVeiculo(false)}
                footer={null}
                width={900}
                style={{ top: 10 }}
                styles={{ body: { maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' } }}
            >
                <FormularioVeiculo
                    frotaId={frota?.id}
                    onCancel={() => setAddingVeiculo(false)}
                    onSuccess={() => {
                        setAddingVeiculo(false);
                        fetchVeiculos();
                    }}
                />
            </Modal>
        </>
    );
};

export default VerVeiculosFrotaModal;
