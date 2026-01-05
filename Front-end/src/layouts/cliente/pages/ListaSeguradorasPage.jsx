import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Typography,
    Spin,
    Button,
    Drawer,
    List,
    Tag,
    Avatar,
    Empty
} from 'antd';
import {
    BankOutlined,
    SafetyCertificateOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ClienteLayout from '../Components/layouts/ClienteLayout';
import clienteService from '../../../services/cliente.service';

const { Title, Text, Paragraph } = Typography;

const ListaSeguradorasPage = () => {
    const navigate = useNavigate();
    const [seguradoras, setSeguradoras] = useState([]);
    const [loading, setLoading] = useState(true);

    // Drawer State
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedSeguradora, setSelectedSeguradora] = useState(null);
    const [segurosSeguradora, setSegurosSeguradora] = useState([]);
    const [loadingSeguros, setLoadingSeguros] = useState(false);

    useEffect(() => {
        loadSeguradoras();
    }, []);

    const loadSeguradoras = async () => {
        try {
            const response = await clienteService.getSeguradoras();
            setSeguradoras(response.data || []);
        } catch (error) {
            console.error("Erro ao carregar seguradoras:", error);
        } finally {
            setLoading(false);
        }
    };

    const showSeguros = async (seguradora) => {
        setSelectedSeguradora(seguradora);
        setDrawerVisible(true);
        setLoadingSeguros(true);
        try {
            const response = await clienteService.getSegurosDaSeguradora(seguradora.id_seguradora);
            setSegurosSeguradora(response.data || []);
        } catch (error) {
            console.error("Erro ao buscar seguros:", error);
            setSegurosSeguradora([]);
        } finally {
            setLoadingSeguros(false);
        }
    };

    const handleContratar = (seguro) => {
        // Navegar para a página de contratação enviando Seguradora e Seguro pré-selecionados
        navigate('/cliente/contratar', {
            state: {
                seguradora: selectedSeguradora,
                seguro: seguro
            }
        });
    };

    return (
        <ClienteLayout>
            <Title level={2}>Seguradoras Parceiras</Title>
            <Paragraph>Conheça as seguradoras disponíveis e escolha a proteção ideal para si.</Paragraph>

            {loading ? <Spin size="large" tip="Carregando seguradoras..." /> : (
                <Row gutter={[24, 24]}>
                    {seguradoras.length > 0 ? seguradoras.map(seguradora => (
                        <Col xs={24} sm={12} md={8} lg={6} key={seguradora.id_seguradora}>
                            <Card
                                hoverable
                                cover={
                                    <div style={{ height: 140, background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {seguradora.logo ?
                                            <img alt={seguradora.nome} src={seguradora.logo} style={{ maxHeight: '80%', maxWidth: '80%' }} /> :
                                            <BankOutlined style={{ fontSize: 48, color: '#ccc' }} />
                                        }
                                    </div>
                                }
                                actions={[
                                    <Button type="link" onClick={() => showSeguros(seguradora)}>Ver Seguros</Button>
                                ]}
                            >
                                <Card.Meta
                                    title={seguradora.nome}
                                    description={<Text ellipsis>{seguradora.endereco || 'Sem endereço'}</Text>}
                                />
                            </Card>
                        </Col>
                    )) : <Col span={24}><Empty description="Nenhuma seguradora registada." /></Col>}
                </Row>
            )}

            {/* Drawer para listar seguros da seguradora selecionada */}
            <Drawer
                title={selectedSeguradora?.nome || 'Seguros'}
                placement="right"
                width={400}
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
            >
                {loadingSeguros ? <Spin /> : (
                    <List
                        itemLayout="vertical"
                        dataSource={segurosSeguradora}
                        renderItem={seguro => (
                            <List.Item
                                actions={[
                                    <Button
                                        type="primary"
                                        icon={<ArrowRightOutlined />}
                                        onClick={() => handleContratar(seguro)}
                                    >
                                        Contratar
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar icon={<SafetyCertificateOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                                    title={seguro.nome}
                                    description={
                                        <div>
                                            <p>{seguro.descricao}</p>
                                            <Tag color="blue">{seguro.categoria?.descricao || 'Geral'}</Tag>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                        locale={{ emptyText: 'Nenhum seguro disponível para esta seguradora.' }}
                    />
                )}
            </Drawer>
        </ClienteLayout>
    );
};

export default ListaSeguradorasPage;
