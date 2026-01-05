// 📁 components/layout/ClienteNavbar.jsx
import React from "react";
import { Layout, Menu } from "antd";
import {
DashboardOutlined,
FileProtectOutlined,
CarOutlined,
HomeOutlined,
DollarOutlined,
} from "@ant-design/icons";


const { Sider } = Layout;


const ClienteNavbar = () => (
<Sider collapsible>
<div style={{ color: "white", padding: 16, fontWeight: "bold" }}>
Cliente
</div>
<Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
<Menu.Item key="1" icon={<DashboardOutlined />}>Dashboard</Menu.Item>
<Menu.Item key="2" icon={<FileProtectOutlined />}>Meus Seguros</Menu.Item>
<Menu.Item key="3" icon={<CarOutlined />}>Veículos</Menu.Item>
<Menu.Item key="4" icon={<HomeOutlined />}>Propriedades</Menu.Item>
<Menu.Item key="5" icon={<DollarOutlined />}>Pagamentos</Menu.Item>
</Menu>
</Sider>
);


export default ClienteNavbar;