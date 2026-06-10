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
  FileAddOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useState, useEffect } from 'react';
import notificationService from '@services/notification.service';
import ContactSupportModal from '@components/ContactSupportModal';
import moment from 'moment';
import 'moment/locale/pt';

const { Header: AntHeader } = Layout;

const Header = ({ collapsed, setCollapsed, isMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

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
    } catch {
      // silent
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
      if (notif.data?.url_acao) navigate(notif.data.url_acao);
    } catch {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch {
      // silent
    }
  };

  const notificationContent = (
    <div style={{ width: isMobile ? '85vw' : 350, maxHeight: 450, overflowY: 'auto' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Notificações</h3>
        <Space>
          {unreadCount > 0 && (
            <Button type="link" size="small" onClick={handleMarkAllRead} style={{ padding: 0 }}>Ler todas</Button>
          )}
          <Button type="link" size="small" onClick={fetchNotifications} disabled={loading} style={{ padding: 0 }}>Atualizar</Button>
        </Space>
      </div>

      {loading && notifications.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center' }}><Spin size="small" /></div>
      ) : notifications.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Empty description="Sem notificações não lidas" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      ) : (
        notifications.map((notif, index) => (
          <div key={notif.id}>
            <div
              style={{ padding: '12px 16px', cursor: 'pointer', transition: 'background 0.2s', background: notif.read_at ? 'transparent' : '#f0f7ff', borderLeft: notif.read_at ? 'none' : '4px solid #2563EB' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.background = notif.read_at ? 'transparent' : '#f0f7ff'}
              onClick={() => handleNotificationClick(notif)}
            >
              <Space align="start" size={12}>
                <div style={{ fontSize: 20, marginTop: 2 }}>
                  {notif.data?.tipo === 'success' ? <CheckCircleOutlined style={{ color: '#10b981' }} /> :
                    notif.data?.tipo === 'error' ? <ExclamationCircleOutlined style={{ color: '#ef4444' }} /> :
                      notif.data?.tipo === 'warning' ? <InfoCircleOutlined style={{ color: '#f59e0b' }} /> :
                        <FileAddOutlined style={{ color: '#2563EB' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2, fontSize: 14 }}>{notif.data?.titulo}</div>
                  <div style={{ fontSize: 13, color: '#4b5563', marginBottom: 4, lineHeight: 1.4 }}>{notif.data?.mensagem}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{moment(notif.created_at).fromNow()}</div>
                </div>
              </Space>
            </div>
            {index < notifications.length - 1 && <Divider style={{ margin: 0 }} />}
          </div>
        ))
      )}
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
              <Avatar size={48} icon={<UserOutlined />} style={{ background: '#1e293b' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{user?.name || 'Agente'}</div>
                <div style={{ fontSize: 13, color: '#666' }}>{user?.email || ''}</div>
              </div>
            </div>
          </Space>
        </div>
      ),
    },
    { type: 'divider' },
    { key: 'perfil', icon: <UserOutlined />, label: 'Meu Perfil', onClick: () => navigate('/agente/perfil') },
    { key: 'configuracoes', icon: <SettingOutlined />, label: 'Configurações', onClick: () => navigate('/agente/configuracoes') },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Sair', danger: true, onClick: handleLogout },
  ];

  return (
    <AntHeader
      style={{
        background: '#fff',
        padding: isMobile ? '0 12px' : '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #E2E8F0',
        boxShadow: 'none',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        height: 64,
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{ fontSize: 18, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Button
          type="text"
          icon={<InfoCircleOutlined />}
          onClick={() => setSupportOpen(true)}
          title="Contactar Suporte"
          style={{ fontSize: 20, width: 40, height: 40, borderRadius: '8px', color: '#64748B' }}
        />
        <ContactSupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />

        <Popover content={notificationContent} trigger="click" placement="bottomRight" overlayStyle={{ paddingTop: 8 }}>
          <Badge count={unreadCount} offset={[-5, 5]} size="small">
            <Button type="text" icon={<BellOutlined />} style={{ fontSize: 20, width: 40, height: 40, borderRadius: '8px', color: '#64748B' }} />
          </Badge>
        </Popover>

        <Divider type="vertical" style={{ height: 24, margin: '0 8px' }} />

        <Dropdown menu={{ items: profileMenuItems }} trigger={['click']} placement="bottomRight">
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '4px 8px', borderRadius: 8, transition: 'background 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Avatar size={32} icon={<UserOutlined />} style={{ background: '#1e293b' }} />
            <span style={{ fontWeight: 600, fontSize: 14, color: '#1F2937', display: isMobile ? 'none' : 'block' }}>
              {user?.name || 'Agente'}
            </span>
          </div>
        </Dropdown>
      </div>
    </AntHeader>
  );
};

export default Header;
