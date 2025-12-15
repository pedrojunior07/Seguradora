import { useEffect, useMemo, useState } from "react";
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
import DataTable from "examples/Tables/DataTable";
import GradientHeader from "components/GradientHeader";

import { apiRequest } from "services/api";
import { normalizeListResponse } from "services/normalize";

function money(value) {
  if (value == null) return "-";
  try {
    return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "MZN" }).format(value);
  } catch {
    return String(value);
  }
}

export default function ClienteApolicePagamentos() {
  const { apoliceId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        setError("");
        const data = await apiRequest(`/cliente/apolices/${apoliceId}/pagamentos`);
        const normalized = normalizeListResponse(data);
        if (!cancelled) setItems(normalized.items);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Erro ao carregar pagamentos");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [apoliceId]);

  const table = useMemo(() => {
    const columns = [
      { Header: "Nº Pagamento", accessor: "numero", align: "left" },
      { Header: "Vencimento", accessor: "venc", align: "center" },
      { Header: "Valor", accessor: "valor", align: "right" },
      { Header: "Status", accessor: "status", align: "center" },
      { Header: "Ação", accessor: "action", align: "center" },
    ];

    const rows = items.map((p) => ({
      numero: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {p?.numero_pagamento || p?.id_pagamento}
        </MDTypography>
      ),
      venc: (
        <MDTypography variant="caption" color="text">
          {p?.data_vencimento ? new Date(p.data_vencimento).toLocaleDateString() : "-"}
        </MDTypography>
      ),
      valor: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {money(p?.valor_parcela)}
        </MDTypography>
      ),
      status: (
        <MDTypography variant="caption" color="text">
          {p?.status || "-"}
        </MDTypography>
      ),
      action: (
        <MDTypography
          component="button"
          type="button"
          variant="caption"
          color="info"
          fontWeight="medium"
          onClick={() => navigate(`/cliente/pagamentos/${p?.id_pagamento}`)}
          sx={{ cursor: "pointer", border: "none", background: "transparent" }}
        >
          Ver
        </MDTypography>
      ),
    }));

    return { columns, rows };
  }, [items, navigate]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <GradientHeader title={`Pagamentos da apólice #${apoliceId}`} />
              <MDBox p={3}>
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
              </MDBox>
              <MDBox pt={0} pb={3} px={3}>
                <DataTable
                  table={table}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                  canSearch
                  loading={loading}
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
