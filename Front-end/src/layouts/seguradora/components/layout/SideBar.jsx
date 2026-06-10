import { Layout, Menu, Avatar } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import './Sidebar.css';
import {
  DashboardOutlined,
  InsuranceOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SettingOutlined,
  TeamOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  PlusCircleOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  SolutionOutlined,
  HistoryOutlined,
  UserSwitchOutlined,
  UserOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/api\/?$/, '');
const getLogoUrl = (path) => (path ? `${apiBase}/storage/${path}` : null);

const Sidebar = ({ collapsed, onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { entidade, user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const routeMap = {
    '1': '/seguradora/dashboard',
    'seguros-listar': '/seguradora/seguros',
    'seguros-criar': '/seguradora/seguros/criar',
    'seguros-categorias': '/seguradora/categorias',
    '2': '/seguradora/apolices',
    'propostas': '/seguradora/propostas',
    '3': '/seguradora/sinistros',
    '4': '/seguradora/clientes',
    '7-1': '/seguradora/usuarios',
    '7-3': '/seguradora/agentes',
    '5': '/seguradora/relatorios',
    'auditoria': '/seguradora/auditoria',
    'verificacao': '/seguradora/perfil/verificacao',
    'parcerias': '/seguradora/parcerias',
    '6': '/seguradora/calendario',
  };

  const handleMenuClick = ({ key }) => {
    if (onMenuClick) onMenuClick();
    if (routeMap[key]) navigate(routeMap[key]);
  };

  const selectedKey = Object.entries(routeMap).find(
    ([, path]) => location.pathname === path
  )?.[0] ?? '1';

  const menuItems = [
    { key: '1', icon: <DashboardOutlined />, label: 'Dashboard' },
    {
      key: 'seguros',
      icon: <SafetyCertificateOutlined />,
      label: 'Seguros',
      children: [
        { key: 'seguros-listar', icon: <UnorderedListOutlined />, label: 'Os meus seguros' },
        ...(isSuperAdmin ? [
          { key: 'seguros-criar', icon: <PlusCircleOutlined />, label: 'Novo seguro' },
          { key: 'seguros-categorias', icon: <AppstoreOutlined />, label: 'Categorias' },
        ] : []),
      ],
    },
    { key: '2', icon: <InsuranceOutlined />, label: 'Apólices' },
    { key: 'propostas', icon: <SolutionOutlined />, label: 'Propostas' },
    { key: '3', icon: <FileTextOutlined />, label: 'Sinistros' },
    { key: '4', icon: <TeamOutlined />, label: 'Clientes' },
    { key: '7-3', icon: <UserSwitchOutlined />, label: 'Agentes' },
    { key: 'parcerias', icon: <ApartmentOutlined />, label: 'Parcerias' },
    ...(isSuperAdmin ? [
      { key: '7-1', icon: <TeamOutlined />, label: 'Equipa' },
      { key: '5', icon: <BarChartOutlined />, label: 'Relatórios' },
      { key: 'auditoria', icon: <HistoryOutlined />, label: 'Auditoria' },
      {
        key: '7',
        icon: <SettingOutlined />,
        label: 'Configurações',
        children: [{ key: '7-2', label: 'Parâmetros' }],
      },
      { key: 'verificacao', icon: <SafetyCertificateOutlined />, label: 'Verificação' },
    ] : []),
    { key: '6', icon: <CalendarOutlined />, label: 'Calendário' },
  ];

  const logoSrc = entidade?.logo
    ? (entidade.logo.startsWith('http') ? entidade.logo : getLogoUrl(entidade.logo))
    : null;

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={260}
      collapsedWidth={72}
      theme="dark"
      style={{
        borderRight: 'none',
        zIndex: 20,
        position: 'sticky',
        top: 0,
        height: '100vh',
        background: '#1e3a5f',
        borderRight: 'none',
      }}
    >
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
        {!collapsed && (
          <span style={{
            fontWeight: 700,
            fontSize: 15,
            color: '#f1f5f9',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {entidade?.nome || 'Seguro+'}
          </span>
        )}
      </div>

      {/* Navigation */}
      <div className="sidebar-menu-container" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{ background: 'transparent', border: 'none', marginTop: 8 }}
        />
      </div>

      {/* User footer */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }}>
        <Avatar
          size={36}
          src={logoSrc || user?.avatar}
          icon={<UserOutlined />}
          style={{ background: '#2563EB', flexShrink: 0 }}
        />
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#f1f5f9',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {user?.name || 'Utilizador'}
            </div>
            <div style={{
              fontSize: 11,
              color: '#94a3b8',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {entidade?.nome || user?.email || ''}
            </div>
          </div>
        )}
      </div>
    </Sider>
  );
};

export default Sidebar;
