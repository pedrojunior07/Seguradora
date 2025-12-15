/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState } from "react";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import GradientHeader from "components/GradientHeader";

import { useAuth } from "auth/AuthContext";

function Overview() {
  const { user, entidade, refreshMe } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRefresh = async () => {
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await refreshMe();
      setSuccess("Perfil atualizado");
    } catch (err) {
      setError(err?.message || "Erro ao atualizar perfil");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <GradientHeader title="Meu perfil" />
              <MDBox p={3}>
                {error ? (
                  <MDBox mb={2}>
                    <MDAlert color="error" dismissible onClose={() => setError("")}>
                      {error}
                    </MDAlert>
                  </MDBox>
                ) : null}
                {success ? (
                  <MDBox mb={2}>
                    <MDAlert color="success" dismissible onClose={() => setSuccess("")}>
                      {success}
                    </MDAlert>
                  </MDBox>
                ) : null}

                <MDBox display="grid" gap={1.5}>
                  <MDTypography variant="button" color="text">
                    Nome: <strong>{user?.name || "-"}</strong>
                  </MDTypography>
                  <MDTypography variant="button" color="text">
                    Email: <strong>{user?.email || "-"}</strong>
                  </MDTypography>
                  <MDTypography variant="button" color="text">
                    Perfil: <strong>{user?.perfil || "-"}</strong>
                  </MDTypography>
                  <MDTypography variant="button" color="text">
                    Entidade: <strong>{entidade?.nome || entidade?.nome_empresa || "-"}</strong>
                  </MDTypography>
                </MDBox>

                <MDBox mt={3} display="flex" justifyContent="flex-end">
                  <MDButton
                    variant="gradient"
                    color="info"
                    onClick={handleRefresh}
                    disabled={submitting}
                  >
                    {submitting ? "Atualizando..." : "Atualizar"}
                  </MDButton>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
