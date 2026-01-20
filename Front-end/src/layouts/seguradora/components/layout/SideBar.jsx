// components/layout/Sidebar.jsx
import { Layout, Menu } from 'antd';
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
  HistoryOutlined
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
      className="min-h-screen"
      width={250}
      breakpoint="lg"
      collapsedWidth="80"
    >
      <div className="h-16 flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)' }}>
        <h1 className={`text-white font-bold ${collapsed ? 'text-xl' : 'text-lg'}`} style={{ color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
          {collapsed ? (entidade?.nome ? entidade.nome.charAt(0).toUpperCase() : 'S') : (entidade?.nome ? entidade.nome : 'SEGURO+')}
        </h1>
      </div>

      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['1']}
        className="mt-4"
        onClick={handleMenuClick}
        items={menuItems}
      />
    </Sider>
  );
};

export default Sidebar;
