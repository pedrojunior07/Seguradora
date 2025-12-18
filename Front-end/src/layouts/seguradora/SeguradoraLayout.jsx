import { useState, useEffect } from 'react';
import { Layout, Drawer } from 'antd';
import { Outlet } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/SideBar';

const { Content } = Layout;

const SeguradoraLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);

    // Detectar tamanho da tela
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 992; // lg breakpoint
            setIsMobile(mobile);

            // Auto-collapse sidebar em telas menores
            if (mobile) {
                setCollapsed(true);
            }
        };

        handleResize(); // Check inicial
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

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Desktop: Sidebar fixa */}
            {!isMobile && <Sidebar collapsed={collapsed} />}

            {/* Mobile: Drawer lateral */}
            {isMobile && (
                <Drawer
                    placement="left"
                    onClose={() => setDrawerVisible(false)}
                    open={drawerVisible}
                    closable={false}
                    size={250}
                    styles={{
                        body: { padding: 0, background: '#001529' }
                    }}
                >
                    <Sidebar collapsed={false} onMenuClick={() => setDrawerVisible(false)} />
                </Drawer>
            )}

            <Layout>
                <Header
                    collapsed={collapsed}
                    setCollapsed={toggleSidebar}
                    isMobile={isMobile}
                />

                <Content
                    style={{
                        margin: isMobile ? '16px' : '24px',
                        minHeight: 280,
                        transition: 'margin 0.2s'
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default SeguradoraLayout;
