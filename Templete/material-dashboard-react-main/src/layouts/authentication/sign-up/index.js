/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useMemo, useState } from "react";

// react-router-dom components
import { Link, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgImage from "assets/images/bg-sign-up-cover.jpeg";
import { useAuth } from "auth/AuthContext";

function Cover() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [perfil, setPerfil] = useState("cliente");
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    nome_empresa: "",
    nuit: "",
    endereco: "",
    licenca: "",
    tipo_cliente: "fisica",
    nome_completo: "",
    documento: "",
    telefone1: "",
    telefone2: "",
  });

  const fields = useMemo(() => {
    if (perfil === "seguradora" || perfil === "corretora") {
      return {
        showEmpresa: true,
        showLicenca: perfil === "corretora",
        showCliente: false,
      };
    }
    return { showEmpresa: false, showLicenca: false, showCliente: true };
  }, [perfil]);

  const update = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!agree) {
      setError("Precisa aceitar os Termos e Condições para continuar.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation || form.password,
        perfil,
      };

      if (fields.showEmpresa) {
        payload.nome_empresa = form.nome_empresa;
        payload.nuit = form.nuit;
        payload.endereco = form.endereco;
        if (fields.showLicenca) payload.licenca = form.licenca;
      } else {
        payload.tipo_cliente = form.tipo_cliente;
        payload.nome_completo = form.nome_completo;
        payload.nuit = form.nuit;
        payload.documento = form.documento;
        payload.endereco = form.endereco;
        payload.telefone1 = form.telefone1;
        payload.telefone2 = form.telefone2 || null;
      }

      await register(payload);
      navigate("/authentication/sign-in", { replace: true });
    } catch (err) {
      setError(err?.message || "Falha ao registrar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CoverLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Join us today
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Enter your email and password to register
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            {error ? (
              <MDBox mb={2}>
                <MDAlert color="error" dismissible onClose={() => setError("")}>
                  {error}
                </MDAlert>
              </MDBox>
            ) : null}

            <MDBox mb={2}>
              <TextField
                select
                fullWidth
                label="Perfil"
                variant="standard"
                value={perfil}
                onChange={(e) => setPerfil(e.target.value)}
              >
                <MenuItem value="seguradora">Seguradora</MenuItem>
                <MenuItem value="corretora">Corretora</MenuItem>
                <MenuItem value="cliente">Cliente</MenuItem>
              </TextField>
            </MDBox>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <MDInput
                  type="text"
                  label="Nome (usuário)"
                  variant="standard"
                  value={form.name}
                  onChange={update("name")}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <MDInput
                  type="email"
                  label="Email"
                  variant="standard"
                  value={form.email}
                  onChange={update("email")}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  type="password"
                  label="Password"
                  variant="standard"
                  value={form.password}
                  onChange={update("password")}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  type="password"
                  label="Confirmar Password"
                  variant="standard"
                  value={form.password_confirmation}
                  onChange={update("password_confirmation")}
                  fullWidth
                />
              </Grid>

              {fields.showEmpresa ? (
                <>
                  <Grid item xs={12}>
                    <MDInput
                      type="text"
                      label="Nome da Empresa"
                      variant="standard"
                      value={form.nome_empresa}
                      onChange={update("nome_empresa")}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      type="text"
                      label="NUIT"
                      variant="standard"
                      value={form.nuit}
                      onChange={update("nuit")}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      type="text"
                      label="Endereço"
                      variant="standard"
                      value={form.endereco}
                      onChange={update("endereco")}
                      fullWidth
                    />
                  </Grid>
                  {fields.showLicenca ? (
                    <Grid item xs={12}>
                      <MDInput
                        type="text"
                        label="Licença"
                        variant="standard"
                        value={form.licenca}
                        onChange={update("licenca")}
                        fullWidth
                      />
                    </Grid>
                  ) : null}
                </>
              ) : null}

              {fields.showCliente ? (
                <>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Tipo de Cliente"
                      variant="standard"
                      value={form.tipo_cliente}
                      onChange={update("tipo_cliente")}
                    >
                      <MenuItem value="fisica">Pessoa Física</MenuItem>
                      <MenuItem value="juridica">Pessoa Jurídica</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      type="text"
                      label="Nome Completo"
                      variant="standard"
                      value={form.nome_completo}
                      onChange={update("nome_completo")}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      type="text"
                      label="NUIT"
                      variant="standard"
                      value={form.nuit}
                      onChange={update("nuit")}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      type="text"
                      label="Documento"
                      variant="standard"
                      value={form.documento}
                      onChange={update("documento")}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      type="text"
                      label="Telefone 1"
                      variant="standard"
                      value={form.telefone1}
                      onChange={update("telefone1")}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      type="text"
                      label="Telefone 2 (opcional)"
                      variant="standard"
                      value={form.telefone2}
                      onChange={update("telefone2")}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      type="text"
                      label="Endereço"
                      variant="standard"
                      value={form.endereco}
                      onChange={update("endereco")}
                      fullWidth
                    />
                  </Grid>
                </>
              ) : null}
            </Grid>

            <MDBox display="flex" alignItems="center" ml={-1} mt={2}>
              <Checkbox checked={agree} onChange={() => setAgree((v) => !v)} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;I agree the&nbsp;
              </MDTypography>
              <MDTypography
                component="a"
                href="#"
                variant="button"
                fontWeight="bold"
                color="info"
                textGradient
              >
                Terms and Conditions
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton
                type="submit"
                variant="gradient"
                color="info"
                fullWidth
                disabled={submitting}
              >
                {submitting ? "Registrando..." : "Criar conta"}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Already have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Sign In
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default Cover;
