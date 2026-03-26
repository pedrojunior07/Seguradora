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
        <Layout style={{ minHeight: '100vh', background: '#F8FAFC' }}>
            {/* Desktop: Sidebar fixa */}
            {!isMobile && <Sidebar collapsed={collapsed} />}

            {/* Mobile: Drawer lateral */}
            {isMobile && (
                <Drawer
                    placement="left"
                    onClose={() => setDrawerVisible(false)}
                    open={drawerVisible}
                    closable={false}
                    width={280}
                    styles={{
                        body: { padding: 0, background: '#FFFFFF' }
                    }}
                >
                    <Sidebar collapsed={false} onMenuClick={() => setDrawerVisible(false)} />
                </Drawer>
            )}

            <Layout style={{ background: 'transparent' }}>
                <Header
                    collapsed={collapsed}
                    setCollapsed={toggleSidebar}
                    isMobile={isMobile}
                />

                <Content
                    style={{
                        margin: isMobile ? '16px' : '32px',
                        padding: isMobile ? '0' : '8px',
                        minHeight: 280,
                        transition: 'all 0.2s',
                    }}
                >
                    <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default SeguradoraLayout;
