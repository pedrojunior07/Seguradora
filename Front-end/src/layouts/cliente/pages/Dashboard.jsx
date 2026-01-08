import React, { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, Table, Tag, message, Typography, Spin } from "antd";
import {
  FileProtectOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CarOutlined,
} from "@ant-design/icons";
import ClienteLayout from "../Components/layouts/ClienteLayout";
import clienteService from "../../../services/cliente.service";
import api from "../../../services/api"; // Para chamar estatísticas específicas se não estiverem no service

const { Text, Title } = Typography;

const DashboardCliente = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_apolices: 0,
    ativas: 0,
    valor_total_premios: 0,
    bens_segurados: 0, // Precisaremos calcular ou buscar
  });
  const [recentPolicies, setRecentPolicies] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // No backend, o ApoliceController tem o método estatisticas
      const [statsRes, policiesRes, veiculosRes, propsRes] = await Promise.all([
        api.get('/cliente/apolices/estatisticas'),
        clienteService.getActivePolicies(),
        clienteService.getMeusVeiculos(),
        clienteService.getMinhasPropriedades()
      ]);

      setStats({
        ...statsRes.data,
        bens_segurados: (veiculosRes.data?.length || 0) + (propsRes.data?.length || 0)
      });

      setRecentPolicies(policiesRes.data || policiesRes || []);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      message.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Nº Apólice",
      dataIndex: "numero_apolice",
      key: "numero",
      render: (v) => <Text strong>{v || 'PENDENTE'}</Text>
    },
    {
      title: "Seguro",
      key: "seguro",
      render: (_, record) => record.seguradora_seguro?.seguro?.nome
    },
    {
      title: "Bem",
      key: "bem",
      render: (_, record) => record.bem_segurado?.marca ? `${record.bem_segurado.marca} ${record.bem_segurado.modelo}` : record.bem_segurado?.descricao
    },
    {
      title: "Prémio",
      dataIndex: "premio_total",
      key: "premio",
      render: (v) => `${parseFloat(v || 0).toLocaleString()} MT`,
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (s) => (
        <Tag color={s === "ativa" ? "green" : "orange"}>
          {s?.toUpperCase().replace('_', ' ')}
        </Tag>
      ),
    },
  ];

  if (loading) return <ClienteLayout><Spin size="large" style={{ display: 'block', margin: '100px auto' }} /></ClienteLayout>;

  return (
    <ClienteLayout>
      <Title level={2}>Olá, Bem-vindo ao SegurosTM</Title>
      <Text type="secondary">Aqui está um resumo das suas proteções atuais.</Text>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Seguros Ativos"
              value={stats.ativas}
              valueStyle={{ color: '#3f8600' }}
              prefix={<FileProtectOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Prémio Total (Anual)"
              value={stats.valor_total_premios}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
              suffix="MT"
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Sinistros Pendentes"
              value={0} // To be implemented
              valueStyle={{ color: '#cf1322' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Meus Bens"
              value={stats.bens_segurados}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Apólices Recentes" style={{ marginTop: 24 }} bordered={false} className="shadow-sm">
        <Table
          columns={columns}
          dataSource={recentPolicies.slice(0, 5)}
          pagination={false}
          rowKey="id_apolice"
          locale={{ emptyText: 'Nenhuma apólice encontrada' }}
        />
      </Card>
    </ClienteLayout>
  );
};

export default DashboardCliente;
