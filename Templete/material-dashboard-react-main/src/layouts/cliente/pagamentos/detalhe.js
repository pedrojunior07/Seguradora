import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAlert from "components/MDAlert";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

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

export default function ClientePagamentoDetalhe() {
  const { pagamentoId } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [pagamento, setPagamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [metodoPagamentoId, setMetodoPagamentoId] = useState("");
  const [referencia, setReferencia] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest(`/cliente/pagamentos/${pagamentoId}`);
      setPagamento(data);
    } catch (err) {
      setError(err?.message || "Erro ao carregar pagamento");
    } finally {
      setLoading(false);
    }
  }, [pagamentoId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleRegister = async () => {
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const fd = new FormData();
      fd.append("pagamento_id", String(pagamentoId));
      fd.append("metodo_pagamento_id", String(metodoPagamentoId));
      if (referencia) fd.append("referencia_pagamento", referencia);
      const file = fileRef.current?.files?.[0];
      if (file) fd.append("comprovante", file);

      const res = await apiRequest(`/cliente/pagamentos/${pagamentoId}/registrar`, {
        method: "POST",
        body: fd,
      });
      setSuccess(res?.message || "Pagamento registado");
      await reload();
    } catch (err) {
      setError(err?.message || "Erro ao registar pagamento");
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
              <GradientHeader title={`Pagamento #${pagamentoId}`} />
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

                {pagamento ? (
                  <MDBox mt={3} display="grid" gap={1.5}>
                    <MDTypography variant="button" color="text">
                      Número: <strong>{pagamento?.numero_pagamento}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Status: <strong>{pagamento?.status}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Vencimento:{" "}
                      <strong>
                        {pagamento?.data_vencimento
                          ? new Date(pagamento.data_vencimento).toLocaleDateString()
                          : "-"}
                      </strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Valor parcela: <strong>{money(pagamento?.valor_parcela)}</strong>
                    </MDTypography>
                    <MDTypography variant="button" color="text">
                      Valor pago: <strong>{money(pagamento?.valor_pago)}</strong>
                    </MDTypography>

                    {pagamento?.status === "pendente" ? (
                      <MDBox mt={2}>
                        <MDTypography variant="button" fontWeight="medium">
                          Registar pagamento
                        </MDTypography>
                        <Grid container spacing={2} mt={1}>
                          <Grid item xs={12} md={4}>
                            <MDInput
                              type="number"
                              label="Método pagamento ID"
                              value={metodoPagamentoId}
                              onChange={(e) => setMetodoPagamentoId(e.target.value)}
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={12} md={8}>
                            <MDInput
                              type="text"
                              label="Referência (opcional)"
                              value={referencia}
                              onChange={(e) => setReferencia(e.target.value)}
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <MDTypography variant="caption" color="text">
                              Comprovante (opcional): PDF/JPG/PNG
                            </MDTypography>
                            <input ref={fileRef} type="file" accept=".pdf,image/*" />
                          </Grid>
                        </Grid>
                        <MDBox mt={2} display="flex" justifyContent="flex-end">
                          <MDButton
                            variant="gradient"
                            color="success"
                            disabled={submitting || !metodoPagamentoId}
                            onClick={handleRegister}
                          >
                            {submitting ? "Registrando..." : "Confirmar"}
                          </MDButton>
                        </MDBox>
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
