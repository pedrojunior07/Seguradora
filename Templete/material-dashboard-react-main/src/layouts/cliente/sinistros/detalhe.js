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

export default function ClienteSinistroDetalhe() {
  const { sinistroId } = useParams();
  const navigate = useNavigate();
  const [sinistro, setSinistro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        setError("");
        const data = await apiRequest(`/cliente/sinistros/${sinistroId}`);
        if (!cancelled) setSinistro(data);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Erro ao carregar sinistro");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [sinistroId]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <GradientHeader title={`Sinistro #${sinistroId}`} color="warning" />
              <MDBox p={3}>
                <MDButton variant="text" color="info" onClick={() => navigate(-1)}>
                  Voltar
                </MDButton>
                <MDButton
                  variant="text"
                  color="warning"
                  onClick={() => navigate(`/cliente/sinistros/${sinistroId}/acompanhamento`)}
                >
                  Acompanhar
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

                {sinistro ? (
                  <MDBox mt={3} display="grid" gap={1.5}>
                    <MDTypography variant="button" color="text">
                      Número: <strong>{sinistro?.numero_sinistro}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Status: <strong>{sinistro?.status}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Apólice:{" "}
                      <strong>{sinistro?.apolice?.numero_apolice || sinistro?.apolice_id}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Seguradora:{" "}
                      <strong>
                        {sinistro?.apolice?.seguradoraSeguro?.seguradora?.nome || "-"}
                      </strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Local: <strong>{sinistro?.local_ocorrencia || "-"}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Descrição: <strong>{sinistro?.descricao_ocorrencia || "-"}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Valor estimado: <strong>{money(sinistro?.valor_estimado_dano)}</strong>
                    </MDTypography>
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
