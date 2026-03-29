// src/layouts/corretora/components/layout/SideBar.jsx
import { Layout, Menu, Badge, Button, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import {
  DashboardOutlined,
  SolutionOutlined,
  PlusCircleOutlined,
  UnorderedListOutlined,
  TeamOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  HistoryOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  UserOutlined,
  InsuranceOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const SideBar = ({ collapsed, onMenuClick }) => {
  const navigate = useNavigate();
  const { entidade, user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const handleMenuClick = ({ key }) => {
    if (onMenuClick) {
      onMenuClick();
    }

    switch (key) {
      case 'dashboard':
        navigate('/corretora/dashboard');
        break;
      case 'proposals-list':
        navigate('/corretora/proposals');
        break;
      case 'proposals-create':
        navigate('/corretora/proposals/create');
        break;
      case 'policies':
        navigate('/corretora/apolices');
        break;
      case 'clients':
        navigate('/corretora/clientes');
        break;
      case 'team':
        navigate('/corretora/equipe');
        break;
      case 'verificacao':
        navigate('/corretora/perfil/verificacao');
        break;
      case 'auditoria':
        navigate('/corretora/auditoria');
        break;
      case 'calendar':
        navigate('/corretora/calendario');
        break;
      default:
        break;
    }
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'proposals',
      icon: <SolutionOutlined />,
      label: 'Gestão de Propostas',
      children: [
        { key: 'proposals-list', icon: <UnorderedListOutlined />, label: 'Minhas Propostas' },
        { key: 'proposals-create', icon: <PlusCircleOutlined />, label: 'Nova Proposta' },
      ],
    },
    {
      key: 'policies',
      icon: <InsuranceOutlined />,
      label: 'Apólices Convertidas',
    },
    {
      key: 'clients',
      icon: <TeamOutlined />,
      label: 'Meus Clientes',
    },
    // Admin only sections
    ...(isSuperAdmin ? [
        {
          key: 'team',
          icon: <TeamOutlined />,
          label: 'Minha Equipe',
        },
        {
          key: 'auditoria',
          icon: <HistoryOutlined />,
          label: 'Auditoria',
        },
        {
          key: 'verificacao',
          icon: <SafetyCertificateOutlined />,
          label: 'Verificação de Conta',
        },
    ] : []),
    {
      key: 'calendar',
      icon: <CalendarOutlined />,
      label: 'Calendário',
    },
    {
        key: 'settings',
        icon: <SettingOutlined />,
        label: 'Configurações',
        children: [
          { key: 'profile', label: 'Perfil da Corretora' },
          { key: 'params', label: 'Parâmetros' },
        ],
    },
  ];

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className="min-h-screen shadow-lg"
      width={280}
      breakpoint="lg"
      collapsedWidth="80"
      theme="light"
      style={{
        borderRight: '1px solid #E2E8F0',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}
    >
      <div className="h-16 flex items-center px-6" style={{ borderBottom: '1px solid #F1F5F9' }}>
        <div className={`flex items-center justify-center rounded-xl shadow-sm ${collapsed ? 'w-10 h-10' : 'w-9 h-9 mr-3'}`}
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)' }}>
          <span className="text-white font-bold text-lg">C</span>
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <h2 className="text-[#1F2937] font-extrabold text-base m-0 tracking-tight leading-tight">
              {entidade?.nome || 'CORRETORA'}
            </h2>
            <span className="text-[#6B7280] text-[10px] font-medium uppercase tracking-wider">Broker System</span>
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          className="mt-4 border-none"
          onClick={handleMenuClick}
          items={menuItems}
          style={{ background: 'transparent' }}
        />

        {!collapsed && (
          <div className="px-4 mt-8">
            <div className="rounded-2xl p-4" style={{
              background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
              border: '1px solid #E2E8F0'
            }}>
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center mr-2 shadow-sm">
                  <InfoCircleOutlined className="text-white" />
                </div>
                <span className="font-bold text-slate-900 text-xs">Suporte à Corretora</span>
              </div>
              <p className="text-slate-700 text-[11px] mb-3 leading-relaxed">
                Precisa de ajuda com suas propostas ou comissão?
              </p>
              <Button type="primary" size="small" block className="rounded-lg text-[11px] font-semibold h-8 shadow-sm" style={{ background: '#1e293b' }}>
                Falar com Suporte
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto border-t border-[#F1F5F9] p-4 bg-[#F8FAFC]">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'px-2'}`}>
          <Avatar
            size={collapsed ? 40 : 44}
            src={entidade?.logo ? (entidade.logo.startsWith('http') ? entidade.logo : `http://127.0.0.1:8000/storage/${entidade.logo}`) : user?.avatar}
            icon={<UserOutlined />}
            className="shadow-sm border-2 border-white"
            style={{ background: '#1e293b' }}
          />
          {!collapsed && (
            <div className="ml-3 overflow-hidden">
              <div className="text-sm font-bold text-[#1F2937] truncate">
                {user?.name || 'Corretor'}
              </div>
              <div className="text-[11px] text-[#6B7280] truncate font-medium">
                {user?.perfil === 'corretora' ? 'Broker Admin' : user?.perfil}
              </div>
            </div>
          )}
        </div>
      </div>
    </Sider>
  );
};

export default SideBar;
