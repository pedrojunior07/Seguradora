import { useState, useEffect } from 'react';
import { Layout, Drawer } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/SideBar';
import { Modal, Typography, Button } from 'antd';
import { SafetyCertificateOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// Rotas de detalhe onde a sidebar fica colapsada automaticamente
const DETAIL_ROUTES = [
    /^\/seguradora\/seguros\/\d+/,
    /^\/seguradora\/propostas\/\d+/,
    /^\/seguradora\/sinistros\/\d+/,
    /^\/seguradora\/clientes\/\d+/,
];

const { Text, Title, Paragraph } = Typography;

const { Content } = Layout;

const SeguradoraLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [userToggled, setUserToggled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Event listener for verification errors
    useEffect(() => {
        const handleNotVerified = (event) => {
            Modal.warning({
                title: 'Verificação de Conta Necessária',
                icon: <SafetyCertificateOutlined style={{ color: '#faad14' }} />,
                content: (
                    <div style={{ marginTop: '16px' }}>
                        <Paragraph style={{ fontSize: '15px' }}>
                            {event.detail.message}
                        </Paragraph>
                        <Text type="secondary">
                            Para garantir a segurança do sistema, todas as seguradoras devem autenticar seus documentos legais antes de fornecer serviços.
                        </Text>
                    </div>
                ),
                okText: 'Fazer Upload Agora',
                onOk: () => {
                    navigate('/seguradora/perfil/verificacao');
                },
                width: 500,
                okButtonProps: {
                    icon: <ArrowRightOutlined />,
                    style: { borderRadius: '10px', height: '40px', fontWeight: 600 }
                }
            });
        };

        window.addEventListener('entity-not-verified', handleNotVerified);
        return () => window.removeEventListener('entity-not-verified', handleNotVerified);
    }, [navigate]);

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

    // Auto-colapsar em páginas de detalhe; expandir ao voltar para listas
    useEffect(() => {
        if (isMobile) return;
        const isDetail = DETAIL_ROUTES.some(r => r.test(location.pathname));
        if (isDetail) {
            setCollapsed(true);
            setUserToggled(false);
        } else if (!userToggled) {
            setCollapsed(false);
        }
    }, [location.pathname, isMobile]);

    const toggleSidebar = () => {
        if (isMobile) {
            setDrawerVisible(!drawerVisible);
        } else {
            setUserToggled(true);
            setCollapsed(c => !c);
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
