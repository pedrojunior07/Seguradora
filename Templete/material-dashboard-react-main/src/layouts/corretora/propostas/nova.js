import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

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

function parseIdList(value) {
  return String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n));
}

export default function CorretoraPropostaNova() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    cliente_id: "",
    seguradora_seguro_id: "",
    tipo_proposta: "veiculo",
    bem_id: "",
    valor_bem: "",
    coberturas: "",
    parcelas_sugeridas: "1",
    data_inicio_proposta: "",
    data_fim_proposta: "",
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
        cliente_id: Number(form.cliente_id),
        seguradora_seguro_id: Number(form.seguradora_seguro_id),
        tipo_proposta: form.tipo_proposta,
        bem_id: Number(form.bem_id),
        valor_bem: Number(form.valor_bem),
        coberturas_selecionadas: parseIdList(form.coberturas),
        parcelas_sugeridas: Number(form.parcelas_sugeridas),
        data_inicio_proposta: form.data_inicio_proposta,
        data_fim_proposta: form.data_fim_proposta,
        observacoes: form.observacoes || null,
      };
      const res = await apiRequest("/corretora/propostas", { method: "POST", body: payload });
      setSuccess(res?.message || "Proposta criada");
      const id = res?.proposta?.id_proposta || res?.proposta?.id;
      if (id) navigate(`/corretora/propostas/${id}`, { replace: true });
    } catch (err) {
      setError(err?.message || "Erro ao criar proposta");
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
              <GradientHeader title="Nova proposta" />
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
                      label="Cliente ID"
                      value={form.cliente_id}
                      onChange={update("cliente_id")}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      type="number"
                      label="Seguradora Seguro ID"
                      value={form.seguradora_seguro_id}
                      onChange={update("seguradora_seguro_id")}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label="Tipo de proposta"
                      value={form.tipo_proposta}
                      onChange={update("tipo_proposta")}
                    >
                      <MenuItem value="veiculo">Veículo</MenuItem>
                      <MenuItem value="propriedade">Propriedade</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      type="number"
                      label="Bem ID"
                      value={form.bem_id}
                      onChange={update("bem_id")}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      type="number"
                      label="Valor do bem"
                      value={form.valor_bem}
                      onChange={update("valor_bem")}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      type="number"
                      label="Parcelas sugeridas (1-12)"
                      value={form.parcelas_sugeridas}
                      onChange={update("parcelas_sugeridas")}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      type="text"
                      label="Coberturas selecionadas (IDs separados por vírgula)"
                      value={form.coberturas}
                      onChange={update("coberturas")}
                      fullWidth
                      required
                    />
                    <MDBox mt={1}>
                      <MDTypography variant="caption" color="text">
                        Ex.: 1,2,3
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      type="date"
                      label="Data início"
                      value={form.data_inicio_proposta}
                      onChange={update("data_inicio_proposta")}
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      type="date"
                      label="Data fim"
                      value={form.data_fim_proposta}
                      onChange={update("data_fim_proposta")}
                      fullWidth
                      required
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
                  <MDButton type="submit" variant="gradient" color="info" disabled={submitting}>
                    {submitting ? "Salvando..." : "Criar proposta"}
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
