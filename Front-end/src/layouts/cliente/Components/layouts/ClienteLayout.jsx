import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Drawer } from 'antd';
import {
    UserOutlined,
    DashboardOutlined,
    FileProtectOutlined,
    SecurityScanOutlined,
    BankOutlined,
    CarOutlined,
    FileTextOutlined,
    CreditCardOutlined,
    AlertOutlined
} from '@ant-design/icons';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import ClienteHeader from './ClienteHeader';

const { Sider, Content } = Layout;

const ClienteLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const location = useLocation();
    const { logout } = useAuth();

    // Detectar tamanho da tela
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 992;
            setIsMobile(mobile);
            if (mobile) setCollapsed(true);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        if (isMobile) {
            setDrawerVisible(!drawerVisible);
        } else {
            setCollapsed(!collapsed);
        }
    };

    // Side Menu Items
    const menuItems = [
        {
            key: '/cliente/dashboard',
            icon: <DashboardOutlined />,
            label: <Link to="/cliente/dashboard" onClick={() => isMobile && setDrawerVisible(false)}>Visão Geral</Link>,
        },
        {
            key: '/cliente/veiculos',
            icon: <CarOutlined />,
            label: <Link to="/cliente/veiculos" onClick={() => isMobile && setDrawerVisible(false)}>Meus Veículos</Link>,
        },
        {
            key: '/cliente/seguradoras',
            icon: <BankOutlined />,
            label: <Link to="/cliente/seguradoras" onClick={() => isMobile && setDrawerVisible(false)}>Seguradoras</Link>,
        },
        {
            key: '/cliente/contratar',
            icon: <SecurityScanOutlined />,
            label: <Link to="/cliente/contratar" onClick={() => isMobile && setDrawerVisible(false)}>Contratar Seguro</Link>,
        },
        {
            key: '/cliente/minhas-propostas',
            icon: <FileTextOutlined />,
            label: <Link to="/cliente/minhas-propostas" onClick={() => isMobile && setDrawerVisible(false)}>Minhas Propostas</Link>,
        },
        {
            key: '/cliente/pagamentos',
            icon: <CreditCardOutlined />,
            label: <Link to="/cliente/pagamentos" onClick={() => isMobile && setDrawerVisible(false)}>Meus Pagamentos</Link>,
        },
        {
            key: '/cliente/apolices',
            icon: <FileProtectOutlined />,
            label: <Link to="/cliente/apolices" onClick={() => isMobile && setDrawerVisible(false)}>Minhas Apólices</Link>,
        },
        {
            key: '/cliente/sinistros',
            icon: <AlertOutlined />,
            label: <Link to="/cliente/sinistros" onClick={() => isMobile && setDrawerVisible(false)}>Meus Sinistros</Link>,
        },
    ];

    const sidebarContent = (
        <>
            <div style={{ height: 64, margin: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography.Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                    {(collapsed && !isMobile) ? 'TM' : 'SegurosTM'}
                </Typography.Title>
            </div>
            <Menu
                theme="light"
                mode="inline"
                selectedKeys={[location.pathname]}
                items={menuItems}
                style={{ borderRight: 0 }}
            />
        </>
    );

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Desktop Sidebar */}
            {!isMobile && (
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
                    {sidebarContent}
                </Sider>
            )}

            {/* Mobile Drawer */}
            {isMobile && (
                <Drawer
                    placement="left"
                    onClose={() => setDrawerVisible(false)}
                    open={drawerVisible}
                    closable={false}
                    width={260}
                    styles={{ body: { padding: 0 } }}
                >
                    {sidebarContent}
                </Drawer>
            )}

            <Layout className="site-layout" style={{
                marginLeft: isMobile ? 0 : (collapsed ? 80 : 260),
                transition: 'all 0.2s',
                minWidth: 0
            }}>
                <ClienteHeader
                    collapsed={isMobile ? false : collapsed}
                    setCollapsed={toggleSidebar}
                    isMobile={isMobile}
                />
                <Content
                    style={{
                        margin: isMobile ? '16px 8px' : '24px 16px',
                        padding: isMobile ? 12 : 24,
                        minHeight: 280,
                        background: '#fff',
                        borderRadius: 8
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default ClienteLayout;
