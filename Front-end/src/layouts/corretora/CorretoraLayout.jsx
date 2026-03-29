// src/layouts/corretora/CorretoraLayout.jsx
import { useState, useEffect } from 'react';
import { Layout, Drawer, Modal, Typography, Button } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './components/layout/Header';
import SideBar from './components/layout/SideBar';
import { SafetyCertificateOutlined, ArrowRightOutlined } from '@ant-design/icons';

const { Text, Title, Paragraph } = Typography;
const { Content } = Layout;

const CorretoraLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const navigate = useNavigate();

    // Event listener for verification errors
    useEffect(() => {
        const handleNotVerified = (event) => {
            Modal.warning({
                title: 'Verificação de Corretora Necessária',
                icon: <SafetyCertificateOutlined style={{ color: '#faad14' }} />,
                content: (
                    <div style={{ marginTop: '16px' }}>
                        <Paragraph style={{ fontSize: '15px' }}>
                            {event.detail.message || 'Sua corretora ainda não foi verificada pelos administradores.'}
                        </Paragraph>
                        <Text type="secondary">
                            Como Corretora, você deve submeter sua documentação de legitimidade antes de emitir propostas ou gerenciar seguros na plataforma.
                        </Text>
                    </div>
                ),
                okText: 'Ir para Verificação',
                onOk: () => {
                    navigate('/corretora/perfil/verificacao');
                },
                width: 500,
                okButtonProps: {
                    icon: <ArrowRightOutlined />,
                    style: { borderRadius: '10px', height: '40px', fontWeight: 600, background: '#1e293b' }
                }
            });
        };

        window.addEventListener('entity-not-verified', handleNotVerified);
        return () => window.removeEventListener('entity-not-verified', handleNotVerified);
    }, [navigate]);

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
            {!isMobile && <SideBar collapsed={collapsed} />}

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
                    <SideBar collapsed={false} onMenuClick={() => setDrawerVisible(false)} />
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

export default CorretoraLayout;
