// 📁 components/layout/ClienteHeader.jsx
import React, { useState, useEffect } from "react";
import { Layout, Avatar, Space, Badge, Popover, Button, List, Typography, Divider, Spin, Empty, Dropdown } from "antd";
import {
    UserOutlined,
    BellOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    LogoutOutlined,
    SettingOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import api from "@services/api";
import notificationService from "@services/notification.service";
import moment from "moment";
import 'moment/locale/pt';

const { Header } = Layout;
const { Text } = Typography;

const ClienteHeader = ({ collapsed, setCollapsed, isMobile }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await notificationService.getNotifications({ unread: true });
            setNotifications(data.data || []);

            const countData = await notificationService.getUnreadCount();
            setUnreadCount(countData.count);
        } catch (error) {
            console.error('Erro ao procurar notificações:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const handleNotificationClick = async (notif) => {
        try {
            if (!notif.read_at) {
                await notificationService.markAsRead(notif.id);
                fetchNotifications();
            }
            if (notif.data?.url_acao) {
                navigate(notif.data.url_acao);
            }
        } catch (error) {
            console.error('Erro ao processar notificação:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            fetchNotifications();
        } catch (error) {
            console.error('Erro ao marcar todas como lidas:', error);
        }
    };

    const notificationContent = (
        <div style={{ width: isMobile ? '85vw' : 320, maxHeight: 400, overflowY: 'auto' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Notificações</h3>
                <Space>
                    {unreadCount > 0 && (
                        <Button type="link" size="small" onClick={handleMarkAllRead} style={{ padding: 0 }}>
                            Ler todas
                        </Button>
                    )}
                    <Button type="link" size="small" onClick={fetchNotifications} disabled={loading} style={{ padding: 0 }}>
                        Atualizar
                    </Button>
                </Space>
            </div>

            {loading && notifications.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center' }}><Spin size="small" /></div>
            ) : notifications.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center' }}><Empty description="Sem notificações" image={Empty.PRESENTED_IMAGE_SIMPLE} /></div>
            ) : (
                notifications.map((notif, index) => (
                    <div key={notif.id}>
                        <div
                            style={{
                                padding: '12px 16px',
                                cursor: 'pointer',
                                background: notif.read_at ? 'transparent' : '#f0f7ff',
                                borderLeft: notif.read_at ? 'none' : '4px solid #1e40af'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseLeave={(e) => e.currentTarget.style.background = notif.read_at ? 'transparent' : '#f0f7ff'}
                            onClick={() => handleNotificationClick(notif)}
                        >
                            <Space align="start" size={12}>
                                {notif.data?.tipo === 'success' ? (
                                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                                ) : notif.data?.tipo === 'error' ? (
                                    <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
                                ) : (
                                    <BellOutlined style={{ color: '#1e40af', fontSize: 20 }} />
                                )}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                                        {notif.data?.titulo}
                                    </div>
                                    <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
                                        {notif.data?.mensagem}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                                        {moment(notif.created_at).fromNow()}
                                    </div>
                                </div>
                            </Space>
                        </div>
                        {index < notifications.length - 1 && <Divider style={{ margin: 0 }} />}
                    </div>
                ))
            )}
            <div
                style={{ padding: '12px 16px', textAlign: 'center', borderTop: '1px solid #f0f0f0', cursor: 'pointer', color: '#1e40af', fontWeight: 600, fontSize: 14 }}
                onClick={() => navigate('/cliente/notificacoes')}
            >
                Ver todas as notificações
            </div>
        </div>
    );

    const profileMenuItems = [
        {
            key: 'perfil',
            icon: <UserOutlined />,
            label: 'Meu Perfil',
            onClick: () => navigate('/cliente/perfil'),
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Sair',
            danger: true,
            onClick: handleLogout,
        },
    ];

    return (
        <Header
            style={{
                background: "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 24px",
                borderBottom: "1px solid #f0f0f0",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                position: 'sticky',
                top: 0,
                zIndex: 999,
                width: '100%'
            }}
        >
            <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={setCollapsed}
                style={{ fontSize: '18px', width: 48, height: 48 }}
            />

            <Space size={24}>
                <Popover content={notificationContent} trigger="click" placement="bottomRight">
                    <Badge count={unreadCount} offset={[-2, 10]}>
                        <Button type="text" icon={<BellOutlined style={{ fontSize: 20 }} />} />
                    </Badge>
                </Popover>

                <Dropdown menu={{ items: profileMenuItems }} trigger={['click']} placement="bottomRight">
                    <Space style={{ cursor: 'pointer' }}>
                        {!isMobile && <Text strong>{user?.name || 'Cliente'}</Text>}
                        <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1e40af' }} />
                    </Space>
                </Dropdown>
            </Space>
        </Header>
    );
};

export default ClienteHeader;