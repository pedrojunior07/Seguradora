import { Layout, Menu, Avatar } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import {
  DashboardOutlined,
  InsuranceOutlined,
  TeamOutlined,
  ShoppingOutlined,
  PlusCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const SideBar = ({ collapsed, onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const routeMap = {
    'dashboard': '/agente/dashboard',
    'seguros': '/agente/seguros',
    'clientes': '/agente/clientes',
    'vendas': '/agente/vendas',
    'vendas-nova': '/agente/vendas/nova',
  };

  const handleMenuClick = ({ key }) => {
    if (onMenuClick) onMenuClick();
    if (routeMap[key]) navigate(routeMap[key]);
  };

  const selectedKey = Object.entries(routeMap).find(
    ([, path]) => location.pathname === path
  )?.[0] ?? 'dashboard';

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'seguros', icon: <InsuranceOutlined />, label: 'Meus Seguros' },
    { key: 'clientes', icon: <TeamOutlined />, label: 'Clientes' },
    {
      key: 'vendas-group',
      icon: <ShoppingOutlined />,
      label: 'Vendas',
      children: [
        { key: 'vendas', icon: <ShoppingOutlined />, label: 'Minhas Vendas' },
        { key: 'vendas-nova', icon: <PlusCircleOutlined />, label: 'Nova Venda' },
      ],
    },
  ];

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={260}
      collapsedWidth={72}
      theme="dark"
      style={{
        background: '#1e3a5f',
        borderRight: 'none',
        zIndex: 20,
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}
    >
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
          <span style={{
            fontWeight: 700,
            fontSize: 15,
            color: '#f1f5f9',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {user?.name || 'Agente'}
          </span>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none' }}>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{ background: 'transparent', border: 'none', marginTop: 8 }}
        />
      </div>

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
              {user?.name || 'Agente'}
            </div>
            <div style={{
              fontSize: 11,
              color: '#94a3b8',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {user?.email || ''}
            </div>
          </div>
        )}
      </div>
    </Sider>
  );
};

export default SideBar;
