// 📁 pages/cliente/Dashboard.jsx
import React from "react";
import { Row, Col, Card, Statistic, Table, Tag } from "antd";
import {
  FileProtectOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CarOutlined,
} from "@ant-design/icons";
import ClienteLayout from "../Components/layouts/ClienteLayout";

const DashboardCliente = () => {
  const kpis = {
    segurosAtivos: 3,
    premioMensal: 18500,
    parcelasPendentes: 2,
    bensSegurados: 4,
  };

  const seguros = [
    { key: 1, tipo: "Automóvel", bem: "Toyota", status: "ativo", premio: 5500 },
    { key: 2, tipo: "Habitação", bem: "Casa T3", status: "ativo", premio: 8000 },
  ];

  const columns = [
    { title: "Tipo", dataIndex: "tipo", key: "tipo" },
    { title: "Bem", dataIndex: "bem", key: "bem" },
    {
      title: "Prémio",
      dataIndex: "premio",
      key: "premio",
      render: (v) => `${v} MT`,
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (s) => (
        <Tag color={s === "ativo" ? "green" : "orange"}>
          {s.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <ClienteLayout>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Seguros"
              value={kpis.segurosAtivos}
              prefix={<FileProtectOutlined />}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="Prémio Mensal"
              value={kpis.premioMensal}
              suffix="MT"
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="Parcelas Pendentes"
              value={kpis.parcelasPendentes}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="Bens"
              value={kpis.bensSegurados}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Meus Seguros" style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={seguros}
          pagination={false}
        />
      </Card>
    </ClienteLayout>
  );
};

export default DashboardCliente;
