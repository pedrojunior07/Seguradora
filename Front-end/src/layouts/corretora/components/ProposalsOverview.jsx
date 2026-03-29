// src/layouts/corretora/components/ProposalsOverview.jsx
import React from 'react';
import { Card, Table, Tag, Button, Typography, Space, Empty } from 'antd';
import { EyeOutlined, ArrowRightOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import corretoraService from '@services/corretora.service';

const { Text, Title } = Typography;

const ProposalsOverview = () => {
  const [proposals, setProposals] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const response = await corretoraService.getProposals();
      setProposals((response.data || []).slice(0, 5)); // Show only latest 5
    } catch (error) {
      console.error('Erro ao buscar propostas:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Código',
      dataIndex: 'codigo',
      key: 'codigo',
      render: (text) => <Text style={{ fontWeight: 700, color: '#0f172a' }}>{text || 'N/A'}</Text>,
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente',
      key: 'cliente',
      render: (cliente) => (
          <Text style={{ fontWeight: 500, color: '#475569' }}>
              {cliente?.nome || 'Cliente Individual'}
          </Text>
      ),
    },
    {
      title: 'Tipo Seguro',
      dataIndex: 'tipo_seguro',
      key: 'tipo_seguro',
      render: (tipo) => (
          <Text style={{ color: '#64748b', fontWeight: 500 }}>
             {tipo?.nome || 'Geral'}
          </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '#f59e0b';
        let bgColor = 'rgba(245, 158, 11, 0.1)';
        let label = 'Pendente';
        
        switch (status) {
          case 'aprovada':
            color = '#06b6d4';
            bgColor = 'rgba(6, 182, 212, 0.1)';
            label = 'Aprovada';
            break;
          case 'convertida':
            color = '#10b981';
            bgColor = 'rgba(16, 185, 129, 0.1)';
            label = 'Convertida';
            break;
          case 'rejeitada':
            color = '#ef4444';
            bgColor = 'rgba(239, 68, 68, 0.1)';
            label = 'Rejeitada';
            break;
          default:
            break;
        }
        
        return (
            <span style={{ 
                color: color, 
                backgroundColor: bgColor, 
                padding: '4px 12px', 
                borderRadius: '20px', 
                fontWeight: 700, 
                fontSize: '12px',
                border: `1px solid ${color}40`,
                textTransform: 'uppercase',
                letterSpacing: '0.02em'
            }}>
                {label}
            </span>
        );
      },
    },
    {
        title: 'Valor Agregado (MZN)',
        dataIndex: 'valor_total',
        key: 'valor_total',
        align: 'right',
        render: (val) => (
            <Text style={{ fontWeight: 700, color: '#0f172a' }}>
                {val ? Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
            </Text>
        ),
    },
    {
      title: '',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button 
          type="text" 
          icon={<EyeOutlined />} 
          onClick={() => navigate(`/corretora/proposals/${record.id}`)}
          style={{ 
            color: '#2563EB',
            background: 'rgba(37, 99, 235, 0.05)',
            borderRadius: '8px',
            border: '1px solid transparent'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(37, 99, 235, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(37, 99, 235, 0.05)'}
        />
      ),
    },
  ];

  return (
    <div style={{ background: 'transparent' }}>
      <style>
          {`
            .premium-table .ant-table {
                background: transparent !important;
            }
            .premium-table .ant-table-thead > tr > th {
                background: #f8fafc !important;
                color: #64748b !important;
                font-weight: 600 !important;
                font-size: 13px !important;
                text-transform: uppercase !important;
                letter-spacing: 0.05em !important;
                border-bottom: 1px solid #e2e8f0 !important;
                padding: 16px 16px !important;
            }
            .premium-table .ant-table-thead > tr > th:first-child {
                border-top-left-radius: 12px !important;
                border-bottom-left-radius: 12px !important;
            }
            .premium-table .ant-table-thead > tr > th:last-child {
                border-top-right-radius: 12px !important;
                border-bottom-right-radius: 12px !important;
            }
            .premium-table .ant-table-tbody > tr > td {
                border-bottom: 1px solid #f1f5f9 !important;
                padding: 20px 16px !important;
                transition: all 0.2s ease !important;
            }
            .premium-table .ant-table-tbody > tr:hover > td {
                background: #f8fafc !important;
            }
            .premium-table .ant-table-tbody > tr:last-child > td {
                border-bottom: none !important;
            }
          `}
      </style>
      <Table
        className="premium-table"
        columns={columns}
        dataSource={proposals}
        rowKey="id"
        loading={loading}
        pagination={false}
        locale={{ 
            emptyText: (
                <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<span style={{ color: '#94a3b8', fontWeight: 500 }}>Nenhuma proposta recente</span>} 
                />
            ) 
        }}
        style={{ borderRadius: '16px', overflow: 'hidden' }}
      />
    </div>
  );
};

export default ProposalsOverview;
