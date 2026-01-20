// components/layout/Header.jsx
import { Layout, Button, Avatar, Dropdown, Badge, Popover, Space, Divider, Spin, Empty } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  FileAddOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useState, useEffect } from 'react';
import api from '@services/api';
import notificationService from '@services/notification.service';
import moment from 'moment';
import 'moment/locale/pt';

const { Header: AntHeader } = Layout;

const Header = ({ collapsed, setCollapsed, isMobile }) => {
  const { user, entidade, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/api\/?$/, '');
  const getLogoUrl = (logoPath) => (logoPath ? `${apiBase}/storage/${logoPath}` : null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications({ unread: true });
      setNotifications(data.data || []);

      const countData = await notificationService.getUnreadCount();
      setUnreadCount(countData.count);
    } catch (error) {
      console.error('Erro ao procurar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.read_at) {
        await notificationService.markAsRead(notif.id);
        fetchNotifications();
      }
      if (notif.data?.url_acao) {
        navigate(notif.data.url_acao);
      }
    } catch (error) {
      console.error('Erro ao processar notificação:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const getTimeAgo = (date) => {
    return moment(date).fromNow();
  };

  const notificationContent = (
    <div style={{ width: isMobile ? '85vw' : 350, maxHeight: 450, overflowY: 'auto' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Notificações</h3>
        <Space>
          {unreadCount > 0 && (
            <Button type="link" size="small" onClick={handleMarkAllRead} style={{ padding: 0 }}>
              Ler todas
            </Button>
          )}
          <Button type="link" size="small" onClick={fetchNotifications} disabled={loading} style={{ padding: 0 }}>
            Atualizar
          </Button>
        </Space>
      </div>

      {loading && notifications.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size="small" />
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Empty description="Sem notificações não lidas" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      ) : (
        notifications.map((notif, index) => (
          <div key={notif.id}>
            <div
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                transition: 'background 0.2s',
                background: notif.read_at ? 'transparent' : '#f0f7ff',
                borderLeft: notif.read_at ? 'none' : '4px solid #1e40af'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.background = notif.read_at ? 'transparent' : '#f0f7ff'}
              onClick={() => handleNotificationClick(notif)}
            >
              <Space align="start" size={12}>
                <div style={{ fontSize: 20, marginTop: 2 }}>
                  {notif.data?.tipo === 'success' ? <CheckCircleOutlined style={{ color: '#10b981' }} /> :
                    notif.data?.tipo === 'error' ? <ExclamationCircleOutlined style={{ color: '#ef4444' }} /> :
                      notif.data?.tipo === 'warning' ? <InfoCircleOutlined style={{ color: '#f59e0b' }} /> :
                        <FileAddOutlined style={{ color: '#1e40af' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2, fontSize: 14 }}>{notif.data?.titulo}</div>
                  <div style={{ fontSize: 13, color: '#4b5563', marginBottom: 4, lineHeight: 1.4 }}>
                    {notif.data?.mensagem}
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{getTimeAgo(notif.created_at)}</div>
                </div>
              </Space>
            </div>
            {index < notifications.length - 1 && <Divider style={{ margin: 0 }} />}
          </div>
        ))
      )}

      <div
        style={{
          padding: '12px 16px',
          textAlign: 'center',
          borderTop: '1px solid #f0f0f0',
          cursor: 'pointer',
          color: '#1e40af',
          fontWeight: 600,
          fontSize: 14,
          position: 'sticky',
          bottom: 0,
          background: '#fff'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        onClick={() => navigate('/seguradora/notificacoes')}
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
              <Avatar size={48} icon={<UserOutlined />} src={entidade?.logo ? getLogoUrl(entidade.logo) : user?.avatar} style={{ background: '#1e40af' }} />
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
          <Badge count={unreadCount} offset={[-5, 5]}>
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
              src={entidade?.logo ? getLogoUrl(entidade.logo) : user?.avatar}
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