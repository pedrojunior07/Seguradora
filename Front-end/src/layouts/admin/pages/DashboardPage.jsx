import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography, message } from 'antd';
import { TeamOutlined, BankOutlined, FileProtectOutlined, AlertOutlined } from '@ant-design/icons';
import AdminService from '../../../services/admin.service';

const { Title } = Typography;

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await AdminService.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error(error);
            message.error("Erro ao carregar estatísticas");
        } finally {
            setLoading(false);
        }
    };

    const userColumns = [
        {
            title: 'Nome',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Perfil',
            dataIndex: 'perfil',
            key: 'perfil',
            render: (role) => <Tag color="blue">{role}</Tag>
        },
        {
            title: 'Data',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => new Date(date).toLocaleDateString()
        }
    ];

    return (
        <div>
            <Title level={2}>Visão Geral do Sistema</Title>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Total de Usuários"
                            value={stats?.stats?.total_usuarios}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Seguradoras"
                            value={stats?.stats?.total_seguradoras}
                            prefix={<BankOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                        <div style={{ fontSize: 12, color: '#888' }}>
                            Ativas: {stats?.stats?.seguradoras_ativas}
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Apólices"
                            value={stats?.stats?.total_apolices}
                            prefix={<FileProtectOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Sinistros"
                            value={stats?.stats?.total_sinistros}
                            prefix={<AlertOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Title level={4}>Últimos Usuários Registrados</Title>
            <Table
                dataSource={stats?.recent_users}
                columns={userColumns}
                rowKey="id"
                loading={loading}
                pagination={false}
            />
        </div>
    );
};

export default DashboardPage;
