import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Drawer } from 'antd';
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
    QuestionCircleOutlined,
    AuditOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { useAuth } from '@context/AuthContext';
import ContactSupportModal from '../../components/ContactSupportModal';
import { Avatar } from 'antd';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [supportOpen, setSupportOpen] = useState(false);

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

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
        { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/admin/seguradoras', icon: <BankOutlined />, label: 'Seguradoras' },
        { key: '/admin/corretoras', icon: <AuditOutlined />, label: 'Corretoras' },
        { key: '/admin/users', icon: <TeamOutlined />, label: 'Utilizadores' },
        ...(user?.role === 'super_admin_system' ? [
            { key: '/admin/settings', icon: <SettingOutlined />, label: 'Configurações' },
            { key: '/admin/audit-logs', icon: <FileProtectOutlined />, label: 'Auditoria' },
        ] : []),
        { type: 'divider' },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Sair', danger: true, onClick: handleLogout },
    ];

    const handleMenuClick = (info) => {
        if (info.key === 'logout') return;
        navigate(info.key);
        if (isMobile) setDrawerVisible(false);
    };

    const SidebarContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Brand */}
            <div style={{
                height: 64,
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                gap: 12,
                overflow: 'hidden',
            }}>
                <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 0 0 3px rgba(37,99,235,0.25)',
                }}>
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: 16, lineHeight: 1 }}>A</span>
                </div>
                {!collapsed && (
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9', whiteSpace: 'nowrap' }}>
                        Admin
                    </span>
                )}
            </div>

            {/* Menu */}
            <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{ background: 'transparent', border: 'none', marginTop: 8 }}
                />
            </div>

            {/* User footer */}
            {!collapsed && (
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'rgba(0,0,0,0.2)',
                }}>
                    <Avatar size={34} icon={<UserOutlined />} style={{ background: '#2563EB', flexShrink: 0 }} />
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user?.name || 'Admin'}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>Administrador</div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {!isMobile && (
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    theme="dark"
                    style={{ background: '#1e3a5f', borderRight: 'none' }}
                >
                    <SidebarContent />
                </Sider>
            )}

            {isMobile && (
                <Drawer
                    placement="left"
                    onClose={() => setDrawerVisible(false)}
                    open={drawerVisible}
                    closable={false}
                    styles={{ body: { padding: 0, background: '#1e3a5f' } }}
                >
                    <SidebarContent />
                </Drawer>
            )}

            <Layout>
                <Header style={{
                    padding: '0 24px',
                    background: '#fff',
                    borderBottom: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <Button
                        type="text"
                        icon={collapsed || isMobile ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => isMobile ? setDrawerVisible(true) : setCollapsed(!collapsed)}
                        style={{ fontSize: 16, width: 40, height: 40 }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Button
                            type="text"
                            icon={<QuestionCircleOutlined style={{ fontSize: 18 }} />}
                            onClick={() => setSupportOpen(true)}
                        />
                        <span style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>
                            {user?.name}
                        </span>
                        <ContactSupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
                    </div>
                </Header>
                <Content style={{ margin: isMobile ? '12px' : '24px', minHeight: 280 }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
