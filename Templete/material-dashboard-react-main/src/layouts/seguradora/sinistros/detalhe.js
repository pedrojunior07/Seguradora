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

export default function SeguradoraSinistroDetalhe() {
  const { sinistroId } = useParams();
  const navigate = useNavigate();
  const [sinistro, setSinistro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [valorAprovado, setValorAprovado] = useState("");
  const [franquia, setFranquia] = useState("");
  const [motivo, setMotivo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest(`/seguradora/sinistros/${sinistroId}`);
      setSinistro(data);
    } catch (err) {
      setError(err?.message || "Erro ao carregar sinistro");
    } finally {
      setLoading(false);
    }
  }, [sinistroId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const call = async (fn) => {
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await fn();
      setSuccess(res?.message || "Operação realizada");
      await reload();
    } catch (err) {
      setError(err?.message || "Erro ao processar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartAnalysis = () =>
    call(() => apiRequest(`/seguradora/sinistros/${sinistroId}/analisar`, { method: "POST" }));

  const handleApprove = () =>
    call(() =>
      apiRequest(`/seguradora/sinistros/${sinistroId}/aprovar`, {
        method: "POST",
        body: {
          valor_aprovado: Number(valorAprovado),
          franquia: franquia ? Number(franquia) : null,
        },
      })
    );

  const handleDeny = () =>
    call(() =>
      apiRequest(`/seguradora/sinistros/${sinistroId}/negar`, {
        method: "POST",
        body: { motivo },
      })
    );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <GradientHeader title={`Detalhe do sinistro #${sinistroId}`} color="warning" />
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
                      Cliente: <strong>{sinistro?.apolice?.cliente?.nome || "-"}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Descrição: <strong>{sinistro?.descricao_ocorrencia || "-"}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Valor estimado: <strong>{money(sinistro?.valor_estimado_dano)}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Valor aprovado: <strong>{money(sinistro?.valor_aprovado)}</strong>
                    </MDTypography>

                    <MDBox mt={2} display="flex" gap={2} flexWrap="wrap" alignItems="flex-end">
                      {sinistro?.status === "aberto" ? (
                        <MDButton
                          variant="gradient"
                          color="warning"
                          disabled={submitting}
                          onClick={handleStartAnalysis}
                        >
                          Iniciar análise
                        </MDButton>
                      ) : null}

                      <MDBox width={{ xs: "100%", md: "220px" }}>
                        <MDInput
                          label="Valor aprovado"
                          type="number"
                          value={valorAprovado}
                          onChange={(e) => setValorAprovado(e.target.value)}
                          fullWidth
                        />
                      </MDBox>
                      <MDBox width={{ xs: "100%", md: "220px" }}>
                        <MDInput
                          label="Franquia (opcional)"
                          type="number"
                          value={franquia}
                          onChange={(e) => setFranquia(e.target.value)}
                          fullWidth
                        />
                      </MDBox>
                      <MDButton
                        variant="gradient"
                        color="success"
                        disabled={submitting || !valorAprovado}
                        onClick={handleApprove}
                      >
                        Aprovar
                      </MDButton>
                    </MDBox>

                    <MDBox mt={2} display="flex" gap={2} flexWrap="wrap" alignItems="flex-end">
                      <MDBox width={{ xs: "100%", md: "520px" }}>
                        <MDInput
                          label="Motivo da negação (mín. 20)"
                          value={motivo}
                          onChange={(e) => setMotivo(e.target.value)}
                          fullWidth
                          multiline
                          rows={2}
                        />
                      </MDBox>
                      <MDButton
                        variant="gradient"
                        color="error"
                        disabled={submitting || motivo.trim().length < 20}
                        onClick={handleDeny}
                      >
                        Negar
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
