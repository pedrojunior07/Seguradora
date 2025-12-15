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

export default function ClienteSinistroAcompanhamento() {
  const { sinistroId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        setError("");
        const res = await apiRequest(`/cliente/sinistros/${sinistroId}/acompanhamento`);
        if (!cancelled) setData(res);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Erro ao carregar acompanhamento");
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
              <GradientHeader title={`Acompanhamento #${sinistroId}`} color="warning" />
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

                {data ? (
                  <MDBox mt={3} display="grid" gap={1.5}>
                    <MDTypography variant="button" color="text">
                      Número: <strong>{data?.numero_sinistro}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Status: <strong>{data?.status}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Data comunicação:{" "}
                      <strong>
                        {data?.data_comunicacao
                          ? new Date(data.data_comunicacao).toLocaleString()
                          : "-"}
                      </strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Data análise:{" "}
                      <strong>
                        {data?.data_analise ? new Date(data.data_analise).toLocaleString() : "-"}
                      </strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Valor estimado: <strong>{money(data?.valor_estimado)}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Valor aprovado: <strong>{money(data?.valor_aprovado)}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Valor indemnização: <strong>{money(data?.valor_indenizacao)}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Observações: <strong>{data?.observacoes || "-"}</strong>
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
