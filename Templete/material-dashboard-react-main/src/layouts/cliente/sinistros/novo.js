import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

export default function ClienteSinistroNovo() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    apolice_id: "",
    data_ocorrencia: "",
    local_ocorrencia: "",
    descricao_ocorrencia: "",
    tipo_sinistro: "",
    causa_provavel: "",
    valor_estimado_dano: "",
    numero_bo: "",
    data_bo: "",
    observacoes: "",
  });

  const update = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const payload = {
        apolice_id: Number(form.apolice_id),
        data_ocorrencia: form.data_ocorrencia,
        local_ocorrencia: form.local_ocorrencia,
        descricao_ocorrencia: form.descricao_ocorrencia,
        tipo_sinistro: form.tipo_sinistro,
        causa_provavel: form.causa_provavel || null,
        valor_estimado_dano: form.valor_estimado_dano ? Number(form.valor_estimado_dano) : null,
        numero_bo: form.numero_bo || null,
        data_bo: form.data_bo || null,
        observacoes: form.observacoes || null,
      };
      const res = await apiRequest("/cliente/sinistros", { method: "POST", body: payload });
      setSuccess(res?.message || "Sinistro registado");
      const id = res?.sinistro?.id_sinistro;
      if (id) navigate(`/cliente/sinistros/${id}`, { replace: true });
    } catch (err) {
      setError(err?.message || "Erro ao registar sinistro");
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
              <GradientHeader title="Registar sinistro" color="warning" />
              <MDBox p={3} component="form" onSubmit={handleSubmit}>
                <MDButton variant="text" color="info" onClick={() => navigate(-1)}>
                  Voltar
                </MDButton>

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

                <Grid container spacing={2} mt={1}>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      type="number"
                      label="Apólice ID"
                      value={form.apolice_id}
                      onChange={update("apolice_id")}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      type="datetime-local"
                      label="Data ocorrência"
                      value={form.data_ocorrencia}
                      onChange={update("data_ocorrencia")}
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      type="text"
                      label="Local ocorrência"
                      value={form.local_ocorrencia}
                      onChange={update("local_ocorrencia")}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      type="text"
                      label="Tipo sinistro"
                      value={form.tipo_sinistro}
                      onChange={update("tipo_sinistro")}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      type="text"
                      label="Descrição ocorrência (mín. 20)"
                      value={form.descricao_ocorrencia}
                      onChange={update("descricao_ocorrencia")}
                      fullWidth
                      required
                      multiline
                      rows={3}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      type="text"
                      label="Causa provável (opcional)"
                      value={form.causa_provavel}
                      onChange={update("causa_provavel")}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      type="number"
                      label="Valor estimado dano (opcional)"
                      value={form.valor_estimado_dano}
                      onChange={update("valor_estimado_dano")}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      type="text"
                      label="Número BO (opcional)"
                      value={form.numero_bo}
                      onChange={update("numero_bo")}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      type="date"
                      label="Data BO (opcional)"
                      value={form.data_bo}
                      onChange={update("data_bo")}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      type="text"
                      label="Observações (opcional)"
                      value={form.observacoes}
                      onChange={update("observacoes")}
                      fullWidth
                      multiline
                      rows={2}
                    />
                  </Grid>
                </Grid>

                <MDBox mt={3} display="flex" justifyContent="flex-end">
                  <MDButton type="submit" variant="gradient" color="warning" disabled={submitting}>
                    {submitting ? "Enviando..." : "Registar"}
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
