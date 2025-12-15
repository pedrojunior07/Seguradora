import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

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

export default function ClienteApolicesLista() {
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
        const data = await apiRequest("/cliente/apolices");
        const normalized = normalizeListResponse(data);
        if (!cancelled) setItems(normalized.items);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Erro ao carregar apólices");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const table = useMemo(() => {
    const columns = [
      { Header: "Nº Apólice", accessor: "numero", align: "left" },
      { Header: "Seguro", accessor: "seguro", align: "left" },
      { Header: "Status", accessor: "status", align: "center" },
      { Header: "Prémio", accessor: "premio", align: "right" },
      { Header: "Ações", accessor: "actions", align: "center" },
    ];

    const rows = items.map((apolice) => {
      const id = apolice?.id_apolice;
      return {
        numero: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {apolice?.numero_apolice || id}
          </MDTypography>
        ),
        seguro: (
          <MDTypography variant="caption" color="text">
            {apolice?.seguradoraSeguro?.seguro?.nome ||
              apolice?.seguradora_seguro?.seguro?.nome ||
              "-"}
          </MDTypography>
        ),
        status: (
          <MDTypography variant="caption" color="text">
            {apolice?.status || "-"}
          </MDTypography>
        ),
        premio: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {money(apolice?.premio_total)}
          </MDTypography>
        ),
        actions: (
          <MDBox display="flex" gap={1} justifyContent="center">
            <MDTypography
              component="button"
              type="button"
              variant="caption"
              color="info"
              fontWeight="medium"
              onClick={() => navigate(`/cliente/apolices/${id}`)}
              sx={{ cursor: "pointer", border: "none", background: "transparent" }}
            >
              Ver
            </MDTypography>
            <MDTypography
              component="button"
              type="button"
              variant="caption"
              color="success"
              fontWeight="medium"
              onClick={() => navigate(`/cliente/apolices/${id}/pagamentos`)}
              sx={{ cursor: "pointer", border: "none", background: "transparent" }}
            >
              Pagamentos
            </MDTypography>
          </MDBox>
        ),
      };
    });

    return { columns, rows };
  }, [items, navigate]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <GradientHeader title="Minhas apólices" />
              <MDBox pt={3}>
                {error ? (
                  <MDBox px={3} pb={2}>
                    <MDTypography variant="button" color="error">
                      {error}
                    </MDTypography>
                  </MDBox>
                ) : null}
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
