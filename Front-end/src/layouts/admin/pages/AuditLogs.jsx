import { useState, useEffect } from 'react';
import { Table, Card, Tag, Typography, Button, Space, DatePicker, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import AdminService from '../../../services/admin.service';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0
    });

    const fetchLogs = async (page = 1) => {
        setLoading(true);
        try {
            const response = await AdminService.getAuditLogs(page);
            setLogs(response.data);
            setPagination({
                current: response.current_page,
                pageSize: response.per_page,
                total: response.total
            });
        } catch (error) {
            console.error(error);
            message.error('Erro ao carregar logs de auditoria.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const columns = [
        {
            title: 'Data/Hora',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 180,
            render: (text) => new Date(text).toLocaleString()
        },
        {
            title: 'Usuário',
            dataIndex: 'user_name',
            key: 'user_name',
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <span style={{ fontWeight: 500 }}>{text || 'Sistema'}</span>
                    <span style={{ fontSize: 12, color: '#888' }}>{record.user_email}</span>
                </Space>
            )
        },
        {
            title: 'Ação',
            dataIndex: 'action',
            key: 'action',
            render: (text) => <Tag color="blue">{text.toUpperCase()}</Tag>
        },
        {
            title: 'Descrição',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'IP',
            dataIndex: 'ip_address',
            key: 'ip_address',
            width: 130,
        }
    ];

    const handleTableChange = (pag) => {
        fetchLogs(pag.current);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Logs de Auditoria</Title>
                <Button icon={<ReloadOutlined />} onClick={() => fetchLogs(pagination.current)}>
                    Atualizar
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={logs}
                    rowKey="id"
                    loading={loading}
                    pagination={pagination}
                    onChange={handleTableChange}
                    size="small"
                />
            </Card>
        </div>
    );
};

export default AuditLogs;
