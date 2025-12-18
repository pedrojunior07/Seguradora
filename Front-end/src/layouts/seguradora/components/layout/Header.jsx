// components/layout/Header.jsx
import { Layout, Button, Avatar, Dropdown, Badge, Popover, Space, Divider } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';

const { Header: AntHeader } = Layout;

const Header = ({ collapsed, setCollapsed, isMobile }) => {
  const { user, entidade, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Sample notifications - replace with real data later
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Nova Apólice Criada',
      message: 'Apólice #12345 foi criada com sucesso',
      time: 'Há 5 minutos',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
    },
    {
      id: 2,
      type: 'warning',
      title: 'Renovação Pendente',
      message: '3 apólices precisam de renovação',
      time: 'Há 1 hora',
      icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />
    },
    {
      id: 3,
      type: 'info',
      title: 'Atualização do Sistema',
      message: 'Nova funcionalidade disponível',
      time: 'Há 2 horas',
      icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />
    }
  ];

  const notificationContent = (
    <div style={{ width: 320, maxHeight: 400, overflowY: 'auto' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Notificações</h3>
      </div>
      {notifications.map((notif, index) => (
        <div key={notif.id}>
          <div
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Space align="start" size={12}>
              <div style={{ fontSize: 20, marginTop: 2 }}>{notif.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{notif.title}</div>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>{notif.message}</div>
                <div style={{ fontSize: 12, color: '#999' }}>{notif.time}</div>
              </div>
            </Space>
          </div>
          {index < notifications.length - 1 && <Divider style={{ margin: 0 }} />}
        </div>
      ))}
      <div
        style={{
          padding: '12px 16px',
          textAlign: 'center',
          borderTop: '1px solid #f0f0f0',
          cursor: 'pointer',
          color: '#1e40af',
          fontWeight: 500
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        Ver todas as notificações
      </div>
    </div>
  );


  const profileMenuItems = [
    {
      key: 'user-info',
      type: 'group',
      label: (
        <div style={{ padding: '8px 0' }}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar size={48} icon={<UserOutlined />} src={user?.avatar} style={{ background: '#1e40af' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>
                  {entidade?.nome || user?.name || 'Usuário'}
                </div>
                <div style={{ fontSize: 13, color: '#666' }}>
                  {user?.email || 'email@exemplo.com'}
                </div>
              </div>
            </div>
          </Space>
        </div>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'perfil',
      icon: <UserOutlined />,
      label: 'Meu Perfil',
      onClick: () => navigate('/seguradora/perfil'),
    },
    {
      key: 'configuracoes',
      icon: <SettingOutlined />,
      label: 'Configurações',
      onClick: () => navigate('/seguradora/configuracoes'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sair',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader
      style={{
        background: '#fff',
        padding: isMobile ? '0 12px' : '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{
          fontSize: 18,
          width: 48,
          height: 48,
          transition: 'all 0.2s'
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Notifications */}
        <Popover
          content={notificationContent}
          trigger="click"
          placement="bottomRight"
          overlayStyle={{ paddingTop: 8 }}
        >
          <Badge count={notifications.length} offset={[-5, 5]}>
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{
                fontSize: 18,
                width: 40,
                height: 40,
                borderRadius: '50%',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            />
          </Badge>
        </Popover>

        {/* Profile Dropdown */}
        <Dropdown
          menu={{ items: profileMenuItems }}
          trigger={['click']}
          placement="bottomRight"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: 8,
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Avatar
              size={36}
              icon={<UserOutlined />}
              src={user?.avatar}
              style={{ background: '#1e40af' }}
            />
            <span
              style={{
                fontWeight: 500,
                fontSize: 14,
                display: isMobile ? 'none' : 'block'
              }}
            >
              {entidade?.nome || user?.name || 'Usuário'}
            </span>
          </div>
        </Dropdown>
      </div>
    </AntHeader>
  );
};

export default Header;