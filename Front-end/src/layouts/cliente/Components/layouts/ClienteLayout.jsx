import { useState, useEffect } from 'react';
import { Layout, Menu, Drawer, Avatar } from 'antd';
import {
    UserOutlined,
    DashboardOutlined,
    FileProtectOutlined,
    SecurityScanOutlined,
    BankOutlined,
    CarOutlined,
    FileTextOutlined,
    CreditCardOutlined,
    AlertOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import ClienteHeader from './ClienteHeader';

const { Sider, Content } = Layout;

const ClienteLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

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

    const routeMap = {
        '/cliente/dashboard': '/cliente/dashboard',
        '/cliente/veiculos': '/cliente/veiculos',
        '/cliente/seguradoras': '/cliente/seguradoras',
        '/cliente/contratar': '/cliente/contratar',
        '/cliente/minhas-propostas': '/cliente/minhas-propostas',
        '/cliente/pagamentos': '/cliente/pagamentos',
        '/cliente/apolices': '/cliente/apolices',
        '/cliente/sinistros': '/cliente/sinistros',
    };

    const menuItems = [
        { key: '/cliente/dashboard', icon: <DashboardOutlined />, label: 'Visão Geral' },
        { key: '/cliente/veiculos', icon: <CarOutlined />, label: 'Meus Veículos' },
        { key: '/cliente/seguradoras', icon: <BankOutlined />, label: 'Seguradoras' },
        { key: '/cliente/contratar', icon: <SecurityScanOutlined />, label: 'Contratar Seguro' },
        { key: '/cliente/minhas-propostas', icon: <FileTextOutlined />, label: 'Minhas Propostas' },
        { key: '/cliente/pagamentos', icon: <CreditCardOutlined />, label: 'Meus Pagamentos' },
        { key: '/cliente/apolices', icon: <FileProtectOutlined />, label: 'Minhas Apólices' },
        { key: '/cliente/sinistros', icon: <AlertOutlined />, label: 'Meus Sinistros' },
    ];

    const handleMenuClick = ({ key }) => {
        navigate(key);
        if (isMobile) setDrawerVisible(false);
    };

    const SidebarContent = ({ isDrawer = false }) => (
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
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: 16, lineHeight: 1 }}>S</span>
                </div>
                {(!collapsed || isDrawer) && (
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9', whiteSpace: 'nowrap' }}>
                        SegurosTM
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
            {(!collapsed || isDrawer) && (
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'rgba(0,0,0,0.2)',
                    overflow: 'hidden',
                }}>
                    <Avatar size={34} icon={<UserOutlined />} style={{ background: '#2563EB', flexShrink: 0 }} />
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user?.name || 'Cliente'}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>Cliente</div>
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
                    width={260}
                    style={{
                        background: '#1e3a5f',
                        borderRight: 'none',
                        overflow: 'auto',
                        height: '100vh',
                        position: 'fixed',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        zIndex: 1000,
                    }}
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
                    width={260}
                    styles={{ body: { padding: 0, background: '#1e3a5f' } }}
                >
                    <SidebarContent isDrawer />
                </Drawer>
            )}

            <Layout style={{
                marginLeft: isMobile ? 0 : (collapsed ? 80 : 260),
                transition: 'all 0.2s',
                minWidth: 0,
            }}>
                <ClienteHeader
                    collapsed={isMobile ? false : collapsed}
                    setCollapsed={toggleSidebar}
                    isMobile={isMobile}
                />
                <Content style={{
                    margin: isMobile ? '16px 8px' : '24px 16px',
                    padding: isMobile ? 12 : 24,
                    minHeight: 280,
                    background: '#fff',
                    borderRadius: 8,
                }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default ClienteLayout;
