import { Card, Button } from 'antd';
import {
  PlusOutlined,
  FileTextOutlined,
  TeamOutlined,
  BarChartOutlined,
  ArrowRightOutlined,
  DollarOutlined,
  CalendarOutlined,
  MessageOutlined,
  FileAddOutlined,
  UserAddOutlined
} from '@ant-design/icons';

const QuickActions = () => {
  const actions = [
    {
      title: 'Nova Apólice',
      description: 'Criar nova apólice',
      icon: <FileAddOutlined />,
      color: '#2563eb',
      bgColor: '#eff6ff',
      borderColor: '#dbeafe',
    },
    {
      title: 'Registrar Sinistro',
      description: 'Processar sinistro',
      icon: <FileTextOutlined />,
      color: '#dc2626',
      bgColor: '#fef2f2',
      borderColor: '#fee2e2',
    },
    {
      title: 'Gerir Agentes',
      description: 'Adicionar agentes',
      icon: <TeamOutlined />,
      color: '#059669',
      bgColor: '#f0fdf4',
      borderColor: '#dcfce7',
    },
    {
      title: 'Relatórios',
      description: 'Ver análises detalhadas',
      icon: <BarChartOutlined />,
      color: '#7c3aed',
      bgColor: '#f5f3ff',
      borderColor: '#ede9fe',
    },
    {
      title: 'Recebimentos',
      description: 'Registrar pagamentos',
      icon: <DollarOutlined />,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      borderColor: '#fef3c7',
    },
    {
      title: 'Agendar Visita',
      description: 'Marcar vistoria',
      icon: <CalendarOutlined />,
      color: '#0891b2',
      bgColor: '#ecfeff',
      borderColor: '#cffafe',
    },
  ];

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-800 text-base">Ações Rápidas</span>
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            6 ações disponíveis
          </span>
        </div>
      }
      className="shadow-sm border border-gray-100 rounded-xl hover:shadow-md transition-shadow duration-300"
      bodyStyle={{ padding: '16px' }}
    >
      <div className="grid grid-cols-1 gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            onClick={() => console.log(action.title)}
            className="w-full h-auto !p-3 !rounded-lg !border hover:scale-[1.02] transition-all duration-200"
            style={{
              borderColor: action.borderColor,
              backgroundColor: '#ffffff',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = action.color;
              e.currentTarget.style.backgroundColor = action.bgColor;
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = action.borderColor;
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg"
                  style={{
                    backgroundColor: action.bgColor,
                    color: action.color,
                  }}
                >
                  <div className="text-lg">{action.icon}</div>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-800 text-sm">
                    {action.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {action.description}
                  </div>
                </div>
              </div>
              <ArrowRightOutlined 
                style={{ 
                  fontSize: '14px', 
                  color: '#9ca3af',
                  transition: 'transform 0.2s ease'
                }}
                className="group-hover:translate-x-1"
              />
            </div>
          </Button>
        ))}
      </div>

      {/* Ação especial de suporte */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
              <MessageOutlined className="text-blue-600 text-lg" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-800 text-sm">Suporte Rápido</div>
              <div className="text-xs text-gray-600">Fale com nossa equipe</div>
            </div>
            <Button 
              type="primary" 
              size="small"
              className="!bg-blue-600 !border-blue-600"
            >
              Chamar
            </Button>
          </div>
        </div>
      </div>

      {/* Estatística rápida */}
      <div className="mt-4 text-center text-xs text-gray-500">
        <div className="flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            3 ações urgentes
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            2 ações pendentes
          </span>
        </div>
      </div>
    </Card>
  );
};

export default QuickActions;
