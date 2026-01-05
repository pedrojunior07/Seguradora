// 📁 components/layout/ClienteHeader.jsx
import React from "react";
import { Layout, Avatar, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";


const { Header } = Layout;


const ClienteHeader = () => (
<Header
style={{
background: "#fff",
display: "flex",
justifyContent: "flex-end",
paddingRight: 24,
}}
>
<Space>
<span>Bem-vindo, Cliente</span>
<Avatar icon={<UserOutlined />} />
</Space>
</Header>
);


export default ClienteHeader;