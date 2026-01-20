import React, { useState, useEffect } from 'react';
import { Card, List, Badge, Button, Space, Typography, Tag, Divider, Spin, Empty, Grid, message } from 'antd';
import {
    BellOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    InfoCircleOutlined,
    DeleteOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import notificationService from '@services/notification.service';
import moment from 'moment';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const NotificacoesPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 15, total: 0 });
    const navigate = useNavigate();
    const screens = useBreakpoint();
    const isMobile = !screens.md;


    const fetchNotifications = async (page = 1) => {
        setLoading(true);
        try {
            const data = await notificationService.getNotifications({
                page,
                per_page: pagination.pageSize
            });
            setNotifications(data.data);
            setPagination({
                ...pagination,
                current: data.current_page,
                total: data.total
            });
        } catch (error) {
            console.error('Erro ao buscar notificações:', error);
            message.error('Erro ao carregar notificações.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            fetchNotifications(pagination.current);
        } catch (error) {
            message.error('Erro ao marcar como lida.');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            message.success('Todas as notificações foram marcadas como lidas.');
            fetchNotifications(1);
        } catch (error) {
            message.error('Erro ao marcar todas como lidas.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationService.deleteNotification(id);
            message.success('Notificação removida.');
            fetchNotifications(pagination.current);
        } catch (error) {
            message.error('Erro ao remover notificação.');
        }
    };

    const getIcon = (tipo) => {
        switch (tipo) {
            case 'success': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
            case 'error': return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
            case 'warning': return <InfoCircleOutlined style={{ color: '#faad14' }} />;
            default: return <BellOutlined style={{ color: '#1e40af' }} />;
        }
    };

    const handleAction = (notif) => {
        if (!notif.read_at) {
            handleMarkAsRead(notif.id);
        }
        if (notif.data?.url_acao) {
            navigate(notif.data.url_acao);
        }
    };

    return (
        <div style={{ padding: isMobile ? '16px' : '24px' }}>
            <Card
                title={
                    <Space>
                        <BellOutlined />
                        <span>Central de Notificações</span>
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        ghost
                        size={isMobile ? 'small' : 'middle'}
                        onClick={handleMarkAllAsRead}
                    >
                        Marcar todas como lidas
                    </Button>
                }
                style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            >
                <List
                    loading={loading}
                    itemLayout="horizontal"
                    dataSource={notifications}
                    pagination={{
                        onChange: (page) => fetchNotifications(page),
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        size: isMobile ? 'small' : 'default',
                        style: { marginTop: 24, textAlign: 'center' }
                    }}
                    locale={{ emptyText: <Empty description="Nenhuma notificação encontrada" /> }}
                    renderItem={(item) => (
                        <List.Item
                            className={`notification-item ${item.read_at ? 'read' : 'unread'}`}
                            actions={[
                                <Button
                                    type="text"
                                    icon={<EyeOutlined />}
                                    onClick={() => handleAction(item)}
                                    title="Ver detalhes"
                                />,
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDelete(item.id)}
                                    title="remover"
                                />
                            ]}
                            style={{
                                padding: isMobile ? '12px 0' : '16px 24px',
                                background: item.read_at ? 'transparent' : '#f0f7ff',
                                borderRadius: 8,
                                marginBottom: 8,
                                border: '1px solid #f0f0f0',
                                transition: 'all 0.3s'
                            }}
                        >
                            <List.Item.Meta
                                avatar={
                                    <div style={{
                                        fontSize: 24,
                                        padding: 8,
                                        background: '#fff',
                                        borderRadius: '50%',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                    }}>
                                        {getIcon(item.data?.tipo)}
                                    </div>
                                }
                                title={
                                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                        <Text strong style={{ fontSize: 16 }}>{item.data?.titulo}</Text>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {moment(item.created_at).calendar()}
                                        </Text>
                                    </Space>
                                }
                                description={
                                    <div style={{ marginTop: 4 }}>
                                        <Text style={{ fontSize: 14, color: '#4b5563' }}>{item.data?.mensagem}</Text>
                                        {!item.read_at && (
                                            <div style={{ marginTop: 8 }}>
                                                <Tag color="blue">Nova</Tag>
                                            </div>
                                        )}
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Card>

            <style>{`
        .notification-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .notification-item.unread {
          border-left: 4px solid #1e40af !important;
        }
      `}</style>
        </div>
    );
};

export default NotificacoesPage;
