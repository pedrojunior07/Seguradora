import { Navigate, Link as RouterLink } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DefaultNavbar from "examples/Navbars/DefaultNavbar";
import PageLayout from "examples/LayoutContainers/PageLayout";

import { useAuth } from "auth/AuthContext";

function getHomeRoute(perfil) {
  if (perfil === "seguradora") return "/seguradora/apolices/pendentes";
  if (perfil === "corretora") return "/corretora/propostas";
  if (perfil === "cliente") return "/cliente/apolices";
  return "/dashboard";
}

export default function Landing() {
  const { isAuthenticated, perfil } = useAuth();

  if (isAuthenticated) return <Navigate to={getHomeRoute(perfil)} replace />;

  return (
    <PageLayout>
      <DefaultNavbar
        action={{
          type: "internal",
          route: "/authentication/sign-in",
          label: "Entrar",
          color: "info",
        }}
      />
      <MDBox mt={14} px={{ xs: 2, lg: 6 }} pb={6}>
        <Grid container spacing={3} alignItems="stretch">
          <Grid item xs={12} lg={7}>
            <Card>
              <MDBox p={4}>
                <MDTypography variant="h3" fontWeight="bold">
                  Sistema de Gestão de Seguros
                </MDTypography>
                <MDTypography variant="body1" color="text" mt={2}>
                  Plataforma para gerir propostas, apólices, sinistros e pagamentos com perfis
                  distintos (Seguradora, Corretora e Cliente).
                </MDTypography>

                <MDBox mt={4} display="flex" gap={2} flexWrap="wrap">
                  <MDButton
                    component={RouterLink}
                    to="/authentication/sign-in"
                    variant="gradient"
                    color="info"
                  >
                    Entrar
                  </MDButton>
                  <MDButton
                    component={RouterLink}
                    to="/authentication/sign-up"
                    variant="outlined"
                    color="info"
                  >
                    Criar conta
                  </MDButton>
                </MDBox>

                <MDBox mt={4}>
                  <MDTypography variant="button" fontWeight="medium" color="text">
                    API:
                  </MDTypography>
                  <MDTypography variant="button" color="text">
                    &nbsp;`{process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api"}`
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} lg={5}>
            <Card>
              <MDBox p={4}>
                <MDTypography variant="h6" fontWeight="medium">
                  Perfis
                </MDTypography>
                <MDBox mt={2}>
                  <MDTypography variant="body2" color="text">
                    Seguradora: aprova/rejeita apólices e analisa sinistros.
                  </MDTypography>
                  <MDTypography variant="body2" color="text" mt={1}>
                    Corretora: cria e envia propostas e converte em apólice.
                  </MDTypography>
                  <MDTypography variant="body2" color="text" mt={1}>
                    Cliente: consulta apólices, regista sinistros e paga prestações.
                  </MDTypography>
                </MDBox>
                <MDBox mt={4}>
                  <MDTypography variant="body2" color="text">
                    Já tem credenciais? Use os usuários do `Back-end/API_TEST_REQUESTS.json`.
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </PageLayout>
  );
}
