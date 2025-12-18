import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Input, Select, message, Spin, Card } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, PoweroffOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import seguroService from '../../../services/seguroService';

const { Search } = Input;
const { Option } = Select;

const ListaSeguros = () => {
  const navigate = useNavigate();
  const [seguros, setSeguros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 15,
    total: 0
  });
  const [filtros, setFiltros] = useState({
    status: null,
    tipo_seguro: null,
    id_categoria: null
  });
  const [categorias, setCategorias] = useState([]);

  // Carregar categorias
  useEffect(() => {
    carregarCategorias();
  }, []);

  // Carregar seguros quando filtros ou paginação mudarem
  useEffect(() => {
    carregarSeguros();
  }, [filtros, pagination.current]);

  const carregarCategorias = async () => {
    try {
      const response = await seguroService.listarCategorias();
      setCategorias(response || []);
    } catch (error) {
      message.error('Erro ao carregar categorias');
    }
  };

  const carregarSeguros = async () => {
    setLoading(true);
    try {
      const params = {
        ...filtros,
        per_page: pagination.pageSize,
        page: pagination.current
      };

      // Remover filtros nulos
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await seguroService.listarSeguros(params);

      setSeguros(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        current: response.current_page || 1
      }));
    } catch (error) {
      message.error('Erro ao carregar seguros');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination(prev => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    }));
  };

  const handleAtivarDesativar = async (id, statusAtual) => {
    try {
      if (statusAtual) {
        await seguroService.desativarSeguro(id);
        message.success('Seguro desativado com sucesso');
      } else {
        await seguroService.ativarSeguro(id);
        message.success('Seguro ativado com sucesso');
      }
      carregarSeguros();
    } catch (error) {
      message.error('Erro ao alterar status do seguro');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: 'Nome',
      dataIndex: ['seguro', 'nome'],
      key: 'nome',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.seguro?.categoria?.descricao}
          </div>
        </div>
      )
    },
    {
      title: 'Tipo',
      dataIndex: ['seguro', 'tipo_seguro'],
      key: 'tipo_seguro',
      width: 120,
      render: (tipo) => {
        const cores = {
          veiculo: 'blue',
          propriedade: 'green',
          vida: 'purple',
          saude: 'red'
        };
        return <Tag color={cores[tipo] || 'default'}>{tipo?.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Prêmio Mínimo',
      dataIndex: 'premio_minimo',
      key: 'premio_minimo',
      width: 150,
      render: (valor) => `${parseFloat(valor).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}`
    },
    {
      title: 'Preço Atual',
      key: 'preco_atual',
      width: 150,
      render: (_, record) => {
        const preco = record.preco_atual;
        if (!preco) return <Tag color="orange">Sem preço</Tag>;
        return `${parseFloat(preco.valor).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}`;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status ? 'green' : 'red'}>
          {status ? 'ATIVO' : 'INATIVO'}
        </Tag>
      )
    },
    {
      title: 'Ações',
      key: 'acoes',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/seguradora/seguros/${record.id}`)}
          >
            Ver
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/seguradora/seguros/${record.id}/editar`)}
          >
            Editar
          </Button>
          <Button
            type="link"
            danger={record.status}
            icon={record.status ? <PoweroffOutlined /> : <CheckCircleOutlined />}
            onClick={() => handleAtivarDesativar(record.id, record.status)}
          >
            {record.status ? 'Desativar' : 'Ativar'}
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Gestão de Seguros</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/seguradora/seguros/criar')}
            style={{ background: '#1e40af' }}
          >
            Criar Novo Seguro
          </Button>
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Select
            placeholder="Filtrar por status"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => setFiltros(prev => ({ ...prev, status: value }))}
          >
            <Option value={1}>Ativo</Option>
            <Option value={0}>Inativo</Option>
          </Select>

          <Select
            placeholder="Filtrar por tipo"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => setFiltros(prev => ({ ...prev, tipo_seguro: value }))}
          >
            <Option value="veiculo">Veículo</Option>
            <Option value="propriedade">Propriedade</Option>
            <Option value="vida">Vida</Option>
            <Option value="saude">Saúde</Option>
          </Select>

          <Select
            placeholder="Filtrar por categoria"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => setFiltros(prev => ({ ...prev, id_categoria: value }))}
          >
            {categorias.map(cat => (
              <Option key={cat.id_categoria} value={cat.id_categoria}>
                {cat.descricao}
              </Option>
            ))}
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={seguros}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          rowKey="id"
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default ListaSeguros;
