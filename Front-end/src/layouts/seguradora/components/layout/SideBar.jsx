// components/layout/Sidebar.jsx
import { Layout, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
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
  AppstoreOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar = ({ collapsed, onMenuClick }) => {
  const navigate = useNavigate();

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
      default:
        break;
    }
  };

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
      <div className="h-16 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)' }}>
        <h1 className={`text-white font-bold ${collapsed ? 'text-xl' : 'text-2xl'}`}>
          {collapsed ? 'S' : 'SEGURO+'}
        </h1>
      </div>

      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['1']}
        className="mt-4"
        onClick={handleMenuClick}
        items={[
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
              { key: 'seguros-criar', icon: <PlusCircleOutlined />, label: 'Novo Seguro' },
              { key: 'seguros-categorias', icon: <AppstoreOutlined />, label: 'Categorias' },
            ],
          },
          {
            key: '2',
            icon: <InsuranceOutlined />,
            label: 'Apólices',
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
            key: '5',
            icon: <BarChartOutlined />,
            label: 'Relatórios',
          },
          {
            key: '6',
            icon: <CalendarOutlined />,
            label: 'Calendário',
          },
          {
            key: '7',
            icon: <SettingOutlined />,
            label: 'Configurações',
            children: [
              { key: '7-1', label: 'Usuários' },
              { key: '7-2', label: 'Parâmetros' },
            ],
          },
        ]}
      />
    </Sider>
  );
};

export default Sidebar;
