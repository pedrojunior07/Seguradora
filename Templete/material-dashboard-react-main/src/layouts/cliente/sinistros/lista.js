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

export default function ClienteSinistrosLista() {
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
        const data = await apiRequest("/cliente/sinistros");
        const normalized = normalizeListResponse(data);
        if (!cancelled) setItems(normalized.items);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Erro ao carregar sinistros");
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
      { Header: "Nº Sinistro", accessor: "numero", align: "left" },
      { Header: "Apólice", accessor: "apolice", align: "left" },
      { Header: "Status", accessor: "status", align: "center" },
      { Header: "Data", accessor: "data", align: "center" },
      { Header: "Ações", accessor: "actions", align: "center" },
    ];

    const rows = items.map((s) => {
      const id = s?.id_sinistro;
      return {
        numero: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {s?.numero_sinistro || id}
          </MDTypography>
        ),
        apolice: (
          <MDTypography variant="caption" color="text">
            {s?.apolice?.numero_apolice || s?.apolice_id || "-"}
          </MDTypography>
        ),
        status: (
          <MDTypography variant="caption" color="text">
            {s?.status || "-"}
          </MDTypography>
        ),
        data: (
          <MDTypography variant="caption" color="text">
            {s?.data_comunicacao ? new Date(s.data_comunicacao).toLocaleDateString() : "-"}
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
              onClick={() => navigate(`/cliente/sinistros/${id}`)}
              sx={{ cursor: "pointer", border: "none", background: "transparent" }}
            >
              Ver
            </MDTypography>
            <MDTypography
              component="button"
              type="button"
              variant="caption"
              color="warning"
              fontWeight="medium"
              onClick={() => navigate(`/cliente/sinistros/${id}/acompanhamento`)}
              sx={{ cursor: "pointer", border: "none", background: "transparent" }}
            >
              Acompanhar
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
        <Grid container spacing={3}>
          <Grid item xs={12} display="flex" justifyContent="flex-end">
            <MDButton
              variant="gradient"
              color="info"
              onClick={() => navigate("/cliente/sinistros/novo")}
            >
              Registar sinistro
            </MDButton>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <GradientHeader title="Sinistros" />
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
