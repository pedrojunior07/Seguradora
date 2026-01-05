import { Card, Progress, List, Tag, Button, Row, Col } from 'antd';
import {
CarOutlined,
HomeOutlined,
HeartOutlined,
MedicineBoxOutlined,
CalendarOutlined,
ArrowUpOutlined,
ArrowDownOutlined,
EyeOutlined
} from '@ant-design/icons';

const PolicySummary = () => {
const policyTypes = [
{
type: 'Automóvel',
count: 560,
icon: <CarOutlined />,
color: '#3B82F6',
bgColor: '#EFF6FF',
borderColor: '#BFDBFE',
change: 12,
  value: 'MZN 4.2M'
},
{
type: 'Residencial',
count: 320,
icon: <HomeOutlined />,
color: '#10B981',
bgColor: '#ECFDF5',
borderColor: '#A7F3D0',
change: 8,
  value: 'MZN 2.8M'
},
{
type: 'Vida',
count: 210,
icon: <HeartOutlined />,
color: '#8B5CF6',
bgColor: '#F5F3FF',
borderColor: '#DDD6FE',
change: 15,
  value: 'MZN 3.6M'
},
{
type: 'Saúde',
count: 158,
icon: <MedicineBoxOutlined />,
color: '#EF4444',
bgColor: '#FEF2F2',
borderColor: '#FECACA',
change: -3,
  value: 'MZN 1.9M'
},
];

const renewals = [
{
month: 'Jan',
count: 45,
target: 50,
status: 'completed'
},
{
month: 'Fev',
count: 38,
target: 45,
status: 'on-track'
},
{
month: 'Mar',
count: 52,
target: 48,
status: 'exceeded'
},
{
month: 'Abr',
count: 41,
target: 42,
status: 'on-track'
},
{
month: 'Mai',
count: 28,
target: 40,
status: 'delayed'
},
];

const totalPolicies = policyTypes.reduce((sum, item) => sum + item.count, 0);
const renewalRate = 78; // Taxa de renovação em porcentagem

return (
<Card
title={
<div className="flex items-center justify-between">
<div>
<span className="font-semibold text-gray-800 text-base">Resumo de Apólices</span>
<Tag color="blue" className="ml-2">
{totalPolicies} ativas
</Tag>
</div>
<Button
type="text"
size="small"
icon={<EyeOutlined />}
className="text-blue-600 hover:text-blue-800"
>
Detalhes
</Button>
</div>
}
className="shadow-sm border border-gray-100 rounded-xl hover:shadow-md transition-shadow duration-300"
bodyStyle={{ padding: '16px' }}
>
{/* Estatísticas rápidas */}
<div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
<div className="grid grid-cols-2 gap-4">
<div>
<div className="text-xs text-gray-600">Taxa de Renovação</div>
<div className="flex items-baseline">
<span className="text-2xl font-bold text-gray-800">{renewalRate}%</span>
<span className="ml-1 text-xs text-green-600 flex items-center">
<ArrowUpOutlined className="mr-1" />
5.2%
</span>
</div>
</div>
<div>
                <div className="text-xs text-gray-600">Prêmio Médio</div>
                <div className="text-lg font-bold text-gray-800">MZN 1.250</div>
</div>
</div>
</div>

text
  {/* Distribuição por tipo */}
  <div className="mb-6">
    <div className="flex items-center justify-between mb-4">
      <h4 className="font-medium text-gray-700 m-0">Distribuição por Tipo</h4>
      <span className="text-xs text-gray-500">% do total</span>
    </div>
    
    <Row gutter={[12, 12]} className="mb-2">
      {policyTypes.map((item, index) => {
        const percentage = Math.round((item.count / totalPolicies) * 100);
        
        return (
          <Col span={12} key={index}>
            <div 
              className="p-3 rounded-lg border hover:shadow-sm transition-all duration-200 cursor-pointer"
              style={{
                backgroundColor: item.bgColor,
                borderColor: item.borderColor,
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: item.color, color: 'white' }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{item.type}</div>
                    <div className="text-xs text-gray-500">{item.count} apólices</div>
                  </div>
                </div>
                <div className={`text-xs font-medium flex items-center ${
                  item.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.change >= 0 ? (
                    <ArrowUpOutlined className="mr-1" />
                  ) : (
                    <ArrowDownOutlined className="mr-1" />
                  )}
                  {Math.abs(item.change)}%
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">{percentage}%</span>
                  <span className="font-medium">{item.value}</span>
                </div>
                <Progress 
                  percent={percentage} 
                  strokeColor={item.color}
                  size="small"
                  showInfo={false}
                  strokeWidth={6}
                  className="m-0"
                />
              </div>
            </div>
          </Col>
        );
      })}
    </Row>
  </div>
  
  {/* Renovações próximas */}
  <div>
    <div className="flex items-center justify-between mb-4">
      <h4 className="font-medium text-gray-700 m-0 flex items-center gap-2">
        <CalendarOutlined className="text-blue-500" />
        Renovações por Mês
      </h4>
      <Tag color="orange" className="text-xs">
        Meta: 225/250
      </Tag>
    </div>
    
    <div className="space-y-3">
      {renewals.map((item, index) => {
        const percentage = Math.round((item.count / item.target) * 100);
        let statusColor = '';
        let statusText = '';
        
        switch(item.status) {
          case 'completed':
            statusColor = 'bg-green-100 text-green-800 border-green-200';
            statusText = 'Concluído';
            break;
          case 'exceeded':
            statusColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
            statusText = 'Excedido';
            break;
          case 'on-track':
            statusColor = 'bg-blue-100 text-blue-800 border-blue-200';
            statusText = 'No prazo';
            break;
          case 'delayed':
            statusColor = 'bg-amber-100 text-amber-800 border-amber-200';
            statusText = 'Atrasado';
            break;
        }
        
        return (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-700 w-8">{item.month}</span>
                <span className="text-sm text-gray-600">
                  {item.count} de {item.target}
                </span>
                <Tag 
                  className={`text-xs px-2 py-0.5 border ${statusColor}`}
                >
                  {statusText}
                </Tag>
              </div>
              <span className="text-sm font-medium text-gray-800">{percentage}%</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: 
                      item.status === 'completed' ? '#10B981' :
                      item.status === 'exceeded' ? '#059669' :
                      item.status === 'on-track' ? '#3B82F6' :
                      '#F59E0B'
                  }}
                />
              </div>
              {percentage > 100 && (
                <div className="text-xs text-emerald-600 font-medium">+{percentage - 100}%</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>

  {/* Rodapé informativo */}
  <div className="mt-6 pt-4 border-t border-gray-100">
    <div className="grid grid-cols-2 gap-4 text-center">
      <div>
        <div className="text-xs text-gray-600">Apólices a vencer</div>
        <div className="text-lg font-bold text-amber-600">18</div>
        <div className="text-xs text-gray-500">próximos 7 dias</div>
      </div>
      <div>
        <div className="text-xs text-gray-600">Novas este mês</div>
        <div className="text-lg font-bold text-green-600">89</div>
        <div className="text-xs text-gray-500">+12% vs anterior</div>
      </div>
    </div>
  </div>
</Card>
);
};

export default PolicySummary