// components/layout/Sidebar.jsx
import { Layout, Menu, Badge, Button, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
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
  InfoCircleOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar = ({ collapsed, onMenuClick }) => {
  const navigate = useNavigate();
  const { entidade, user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const handleMenuClick = ({ key }) => {
    // Callback para fechar drawer no mobile
    if (onMenuClick) {
      onMenuClick();
    }

    switch (key) {
      case '1':
        navigate('/seguradora/dashboard');
        break;
      case 'seguros-listar':
        navigate('/seguradora/seguros');
        break;
      case 'seguros-criar':
        navigate('/seguradora/seguros/criar');
        break;
      case 'seguros-categorias':
        navigate('/seguradora/categorias');
        break;
      case '2':
        navigate('/seguradora/apolices');
        break;
      case 'propostas':
        navigate('/seguradora/propostas');
        break;
      case '3':
        navigate('/seguradora/sinistros');
        break;
      case '4':
        navigate('/seguradora/clientes');
        break;
      case '5':
        navigate('/seguradora/relatorios');
        break;
      case '6':
        navigate('/seguradora/calendario');
        break;
      case '7-1':
        navigate('/seguradora/usuarios');
        break;
      case '7-3':
        navigate('/seguradora/agentes');
        break;
      case 'auditoria':
        navigate('/seguradora/auditoria');
        break;
      default:
        break;
    }
  };

  const menuItems = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'seguros',
      icon: <SafetyCertificateOutlined />,
      label: 'Gestão de Seguros',
      children: [
        { key: 'seguros-listar', icon: <UnorderedListOutlined />, label: 'Meus Seguros' },
        // Apenas Super Admin pode criar e gerenciar categorias
        ...(isSuperAdmin ? [
          { key: 'seguros-criar', icon: <PlusCircleOutlined />, label: 'Novo Seguro' },
          { key: 'seguros-categorias', icon: <AppstoreOutlined />, label: 'Categorias' },
        ] : []),
      ],
    },
    {
      key: '2',
      icon: <InsuranceOutlined />,
      label: 'Apólices',
    },
    {
      key: 'propostas',
      icon: <SolutionOutlined />,
      label: 'Propostas',
    },
    {
      key: '3',
      icon: <FileTextOutlined />,
      label: 'Sinistros',
    },
    {
      key: '4',
      icon: <TeamOutlined />,
      label: 'Clientes',
    },
    {
      key: '7-3',
      icon: <UserSwitchOutlined />,
      label: 'Gestão de Agentes',
    },
    // Apenas Super Admin vê Relatórios e Configurações
    ...(isSuperAdmin ? [
      {
        key: '7-1',
        icon: <TeamOutlined />,
        label: 'Minha Equipe',
      },
      {
        key: '5',
        icon: <BarChartOutlined />,
        label: 'Relatórios',
      },
      {
        key: 'auditoria',
        icon: <HistoryOutlined />,
        label: 'Auditoria de Ações',
      },
      {
        key: '7',
        icon: <SettingOutlined />,
        label: 'Configurações',
        children: [
          { key: '7-2', label: 'Parâmetros' },
        ],
      },
    ] : []),
    {
      key: '6',
      icon: <CalendarOutlined />,
      label: 'Calendário',
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
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="h-16 flex items-center px-6" style={{ borderBottom: '1px solid #F1F5F9' }}>
        <div className={`flex items-center justify-center rounded-xl shadow-sm ${collapsed ? 'w-10 h-10' : 'w-9 h-9 mr-3'}`}
          style={{ background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)' }}>
          <span className="text-white font-bold text-lg">S</span>
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <h2 className="text-[#1F2937] font-extrabold text-base m-0 tracking-tight leading-tight">
              {entidade?.nome ? entidade.nome : 'SEGURO+'}
            </h2>
            <span className="text-[#6B7280] text-[10px] font-medium uppercase tracking-wider">Premium System</span>
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={['1']}
          className="mt-4 border-none sidebar-menu"
          onClick={handleMenuClick}
          items={menuItems.map(item => {
            // Add badges for more "interesting" look
            if (item.key === 'propostas') {
              return { ...item, label: <div className="flex justify-between items-center w-full"><span>{item.label}</span>{!collapsed && <Badge count={3} size="small" style={{ backgroundColor: '#10B981' }} />}</div> };
            }
            if (item.key === '3') { // Sinistros
              return { ...item, label: <div className="flex justify-between items-center w-full"><span>{item.label}</span>{!collapsed && <Badge count={2} size="small" style={{ backgroundColor: '#EF4444' }} />}</div> };
            }
            return item;
          })}
          style={{ background: 'transparent' }}
        />

        {!collapsed && (
          <div className="px-4 mt-8">
            <div className="rounded-2xl p-4" style={{
              background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
              border: '1px solid #BFDBFE'
            }}>
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-2 shadow-sm">
                  <InfoCircleOutlined className="text-white" />
                </div>
                <span className="font-bold text-blue-900 text-xs">Suporte Premium</span>
              </div>
              <p className="text-blue-800 text-[11px] mb-3 leading-relaxed">
                Precisa de ajuda com suas apólices ou sinistros?
              </p>
              <Button type="primary" size="small" block className="rounded-lg text-[11px] font-semibold h-8 shadow-sm">
                Falar com Consultor
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
            style={{ background: '#2563EB' }}
          />
          {!collapsed && (
            <div className="ml-3 overflow-hidden">
              <div className="text-sm font-bold text-[#1F2937] truncate">
                {user?.name || 'Administrador'}
              </div>
              <div className="text-[11px] text-[#6B7280] truncate font-medium">
                {user?.perfil === 'seguradora' ? 'Gestor de Seguradora' : user?.perfil}
              </div>
            </div>
          )}
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
