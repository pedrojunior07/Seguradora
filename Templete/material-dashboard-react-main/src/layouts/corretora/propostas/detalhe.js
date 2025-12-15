import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

import { apiRequest } from "services/api";

function money(value) {
  if (value == null) return "-";
  try {
    return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "MZN" }).format(value);
  } catch {
    return String(value);
  }
}

export default function CorretoraPropostaDetalhe() {
  const { propostaId } = useParams();
  const navigate = useNavigate();
  const [proposta, setProposta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest(`/corretora/propostas/${propostaId}`);
      setProposta(data);
    } catch (err) {
      setError(err?.message || "Erro ao carregar proposta");
    } finally {
      setLoading(false);
    }
  }, [propostaId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleSend = async () => {
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await apiRequest(`/corretora/propostas/${propostaId}/enviar`, { method: "POST" });
      setSuccess(res?.message || "Proposta enviada");
      await reload();
    } catch (err) {
      setError(err?.message || "Erro ao enviar proposta");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConvert = async () => {
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await apiRequest(`/corretora/propostas/${propostaId}/converter-apolice`, {
        method: "POST",
      });
      setSuccess(res?.message || "Apólice gerada");
      await reload();
    } catch (err) {
      setError(err?.message || "Erro ao converter proposta");
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
              <GradientHeader title={`Detalhe da proposta #${propostaId}`} />
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

                {proposta ? (
                  <MDBox mt={3} display="grid" gap={1.5}>
                    <MDTypography variant="button" color="text">
                      Número: <strong>{proposta?.numero_proposta}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Status: <strong>{proposta?.status}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Cliente: <strong>{proposta?.cliente?.nome || "-"}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Seguro:{" "}
                      <strong>
                        {proposta?.seguradoraSeguro?.seguro?.nome ||
                          proposta?.seguradora_seguro?.seguro?.nome ||
                          "-"}
                      </strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Valor do bem: <strong>{money(proposta?.valor_bem)}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Prémio calculado: <strong>{money(proposta?.premio_calculado)}</strong>
                    </MDTypography>

                    <MDBox mt={2} display="flex" gap={2} flexWrap="wrap">
                      <MDButton
                        variant="gradient"
                        color="info"
                        onClick={handleSend}
                        disabled={submitting}
                      >
                        Enviar
                      </MDButton>
                      <MDButton
                        variant="gradient"
                        color="success"
                        onClick={handleConvert}
                        disabled={submitting}
                      >
                        Converter em apólice
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
