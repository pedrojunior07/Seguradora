import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
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

export default function CorretoraPropostasLista() {
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
        const data = await apiRequest("/corretora/propostas");
        const normalized = normalizeListResponse(data);
        if (!cancelled) setItems(normalized.items);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Erro ao carregar propostas");
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
      { Header: "Nº Proposta", accessor: "numero", align: "left" },
      { Header: "Cliente", accessor: "cliente", align: "left" },
      { Header: "Seguro", accessor: "seguro", align: "left" },
      { Header: "Prémio", accessor: "premio", align: "right" },
      { Header: "Status", accessor: "status", align: "center" },
      { Header: "Ação", accessor: "action", align: "center" },
    ];

    const rows = items.map((p) => ({
      numero: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {p?.numero_proposta || p?.id_proposta || p?.id}
        </MDTypography>
      ),
      cliente: (
        <MDTypography variant="caption" color="text">
          {p?.cliente?.nome || "-"}
        </MDTypography>
      ),
      seguro: (
        <MDTypography variant="caption" color="text">
          {p?.seguradora_seguro?.seguro?.nome || p?.seguradoraSeguro?.seguro?.nome || "-"}
        </MDTypography>
      ),
      premio: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {money(p?.premio_calculado)}
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
          onClick={() => navigate(`/corretora/propostas/${p?.id_proposta || p?.id}`)}
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
          <Grid item xs={12} display="flex" justifyContent="flex-end">
            <MDButton
              variant="gradient"
              color="info"
              onClick={() => navigate("/corretora/propostas/nova")}
            >
              Nova proposta
            </MDButton>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <GradientHeader title="Propostas" />
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
