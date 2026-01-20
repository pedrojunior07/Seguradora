// 📁 components/layout/ClienteLayout.jsx
import React from "react";
import { Layout } from "antd";
import ClienteNavbar from "./ClienteNavbar";
import ClienteHeader from "./ClienteHeader";


const { Content } = Layout;


const ClienteLayout = ({ children }) => {
return (
<Layout style={{ minHeight: "100vh" }}>
<ClienteNavbar />
<Layout>
<ClienteHeader />
<Content style={{ margin: "24px" }}>{children}</Content>
</Layout>
</Layout>
);
};


export default ClienteLayout;