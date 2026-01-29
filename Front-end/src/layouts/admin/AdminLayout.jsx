import { useState, useEffect } from 'react';
import { Layout, Menu, Button, theme, Drawer } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    BankOutlined,
    TeamOutlined,
    LogoutOutlined,
    SettingOutlined,
    FileProtectOutlined,
    QuestionCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '@context/AuthContext';
import ContactSupportModal from '../../components/ContactSupportModal';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [supportOpen, setSupportOpen] = useState(false);

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    // Responsividade
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

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        {
            key: '/admin/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/admin/seguradoras',
            icon: <BankOutlined />,
            label: 'Seguradoras',
        },
        {
            key: '/admin/users',
            icon: <TeamOutlined />,
            label: 'Usuários',
        },
        // Only for Super Admin System
        ...(user?.role === 'super_admin_system' ? [
            {
                key: '/admin/settings',
                icon: <SettingOutlined />,
                label: 'Configurações',
            },
            {
                key: '/admin/audit-logs',
                icon: <FileProtectOutlined />,
                label: 'Auditoria',
            }
        ] : []),
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Sair',
            danger: true,
            onClick: handleLogout
        },
    ];

    const handleMenuClick = (info) => {
        if (info.key === 'logout') return;
        navigate(info.key);
        if (isMobile) setDrawerVisible(false);
    };

    const SidebarContent = () => (
        <>
            <div className="demo-logo-vertical" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6 }} />
            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[location.pathname]}
                items={menuItems}
                onClick={handleMenuClick}
            />
        </>
    );

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {!isMobile && (
                <Sider trigger={null} collapsible collapsed={collapsed}>
                    <SidebarContent />
                </Sider>
            )}

            {isMobile && (
                <Drawer
                    placement="left"
                    onClose={() => setDrawerVisible(false)}
                    open={drawerVisible}
                    closable={false}
                    width={250}
                    bodyStyle={{ padding: 0, background: '#001529' }}
                >
                    <SidebarContent />
                </Drawer>
            )}

            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                            type="text"
                            icon={collapsed || isMobile ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => isMobile ? setDrawerVisible(true) : setCollapsed(!collapsed)}
                            style={{
                                fontSize: '16px',
                                width: 64,
                                height: 64,
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginRight: 24 }}>
                        <Button
                            type="text"
                            icon={<QuestionCircleOutlined style={{ fontSize: '20px' }} />}
                            onClick={() => setSupportOpen(true)}
                            title="Contactar Suporte"
                            style={{ marginRight: 16 }}
                        />
                        <span style={{ fontWeight: 'bold' }}>
                            Painel Administrativo - {user?.name}
                        </span>
                        <ContactSupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
                    </div>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
