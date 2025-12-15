import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";

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

export default function SeguradoraApoliceDetalhe() {
  const { apoliceId } = useParams();
  const navigate = useNavigate();
  const [apolice, setApolice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [motivo, setMotivo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest(`/seguradora/apolices/${apoliceId}`);
      setApolice(data);
    } catch (err) {
      setError(err?.message || "Erro ao carregar apólice");
    } finally {
      setLoading(false);
    }
  }, [apoliceId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleApprove = async () => {
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await apiRequest(`/seguradora/apolices/${apoliceId}/aprovar`, { method: "POST" });
      setSuccess(res?.message || "Apólice aprovada");
      await reload();
    } catch (err) {
      setError(err?.message || "Erro ao aprovar apólice");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await apiRequest(`/seguradora/apolices/${apoliceId}/rejeitar`, {
        method: "POST",
        body: { motivo },
      });
      setSuccess(res?.message || "Apólice rejeitada");
      await reload();
    } catch (err) {
      setError(err?.message || "Erro ao rejeitar apólice");
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
              <GradientHeader title={`Detalhe da apólice #${apoliceId}`} />
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

                {success ? (
                  <MDBox mt={2}>
                    <MDAlert color="success" dismissible onClose={() => setSuccess("")}>
                      {success}
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
                      Cliente: <strong>{apolice?.cliente?.nome || "-"}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Seguro:{" "}
                      <strong>
                        {apolice?.seguradoraSeguro?.seguro?.nome ||
                          apolice?.seguradora_seguro?.seguro?.nome ||
                          "-"}
                      </strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Valor segurado: <strong>{money(apolice?.valor_segurado)}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Prémio total: <strong>{money(apolice?.premio_total)}</strong>
                    </MDTypography>

                    {apolice?.status === "pendente_aprovacao" ? (
                      <MDBox mt={2} display="flex" gap={2} flexWrap="wrap" alignItems="flex-end">
                        <MDButton
                          variant="gradient"
                          color="success"
                          disabled={submitting}
                          onClick={handleApprove}
                        >
                          Aprovar
                        </MDButton>
                        <MDBox width={{ xs: "100%", md: "320px" }}>
                          <MDInput
                            label="Motivo da rejeição (mín. 10)"
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            fullWidth
                          />
                        </MDBox>
                        <MDButton
                          variant="gradient"
                          color="error"
                          disabled={submitting || !motivo}
                          onClick={handleReject}
                        >
                          Rejeitar
                        </MDButton>
                      </MDBox>
                    ) : null}
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
