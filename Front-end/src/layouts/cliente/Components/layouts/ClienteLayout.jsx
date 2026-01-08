import React, { useState } from 'react';
import { Layout, Menu, Avatar, Row, Col, Typography, Dropdown } from 'antd';
import {
    UserOutlined,
    DashboardOutlined,
    FileProtectOutlined,
    SecurityScanOutlined,
    LogoutOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    BankOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext'; // Ajustar path context

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const ClienteLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    // Side Menu Items
    const menuItems = [
        {
            key: '/cliente/dashboard',
            icon: <DashboardOutlined />,
            label: <Link to="/cliente/dashboard">Visão Geral</Link>,
        },
        {
            key: '/cliente/seguradoras',
            icon: <BankOutlined />,
            label: <Link to="/cliente/seguradoras">Seguradoras</Link>,
        },
        {
            key: '/cliente/contratar',
            icon: <SecurityScanOutlined />,
            label: <Link to="/cliente/contratar">Contratar Seguro</Link>,
        },
        {
            key: '/cliente/apolices',
            icon: <FileProtectOutlined />,
            label: <Link to="/cliente/apolices">Meus Seguros</Link>,
        },
    ];

    // const handleMenuClick = ({ key }) => {
    //     navigate(key);
    // };

    // User Dropdown Items (AntD v5 syntax)
    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Meu Perfil',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Sair',
            danger: true,
        },
    ];

    const handleUserMenuClick = ({ key }) => {
        if (key === 'logout') {
            logout();
        } else if (key === 'profile') {
            // navigate('/cliente/perfil');
            console.log("Profile clicked");
        }
    };


    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                theme="light"
                width={260}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 1000,
                    boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)'
                }}
            >
                <div style={{ height: 64, margin: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography.Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                        {collapsed ? 'TM' : 'SegurosTM'}
                    </Typography.Title>
                </div>
                <Menu
                    theme="light"
                    mode="inline"
                    defaultSelectedKeys={[location.pathname]}
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                // onClick={handleMenuClick} // Navigation handled by Link
                />
            </Sider>
            <Layout className="site-layout" style={{ marginLeft: collapsed ? 80 : 260, transition: 'all 0.2s' }}>
                <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 999, width: '100%', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
                    {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                        className: 'trigger',
                        onClick: () => setCollapsed(!collapsed),
                        style: { fontSize: 20, cursor: 'pointer' }
                    })}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Text strong>{user?.name || 'Cliente'}</Text>
                        <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
                            <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer', backgroundColor: '#87d068' }} />
                        </Dropdown>
                    </div>
                </Header>
                <Content
                    className="site-layout-background"
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default ClienteLayout;
