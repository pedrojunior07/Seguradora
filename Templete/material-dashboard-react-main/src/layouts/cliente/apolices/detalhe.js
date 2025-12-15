import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAlert from "components/MDAlert";
import MDButton from "components/MDButton";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import GradientHeader from "components/GradientHeader";

import { apiRequest } from "services/api";

function money(value) {
  if (value == null) return "-";
  try {
    return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "MZN" }).format(value);
  } catch {
    return String(value);
  }
}

export default function ClienteApoliceDetalhe() {
  const { apoliceId } = useParams();
  const navigate = useNavigate();
  const [apolice, setApolice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        setError("");
        const data = await apiRequest(`/cliente/apolices/${apoliceId}`);
        if (!cancelled) setApolice(data);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Erro ao carregar apólice");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [apoliceId]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <GradientHeader title={`Apólice #${apoliceId}`} />
              <MDBox p={3}>
                <MDButton variant="text" color="info" onClick={() => navigate(-1)}>
                  Voltar
                </MDButton>

                {loading ? (
                  <MDTypography variant="button" color="text">
                    Carregando...
                  </MDTypography>
                ) : null}

                {error ? (
                  <MDBox mt={2}>
                    <MDAlert color="error" dismissible onClose={() => setError("")}>
                      {error}
                    </MDAlert>
                  </MDBox>
                ) : null}

                {apolice ? (
                  <MDBox mt={3} display="grid" gap={1.5}>
                    <MDTypography variant="button" color="text">
                      Número: <strong>{apolice?.numero_apolice}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Status: <strong>{apolice?.status}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Seguradora:{" "}
                      <strong>{apolice?.seguradoraSeguro?.seguradora?.nome || "-"}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Seguro: <strong>{apolice?.seguradoraSeguro?.seguro?.nome || "-"}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Valor segurado: <strong>{money(apolice?.valor_segurado)}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Prémio total: <strong>{money(apolice?.premio_total)}</strong>
                    </MDTypography>
                    <MDBox mt={2}>
                      <MDButton
                        variant="gradient"
                        color="success"
                        onClick={() => navigate(`/cliente/apolices/${apoliceId}/pagamentos`)}
                      >
                        Ver pagamentos
                      </MDButton>
                    </MDBox>
                  </MDBox>
                ) : null}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
