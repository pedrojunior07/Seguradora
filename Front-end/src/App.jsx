import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from '@context/AuthContext';
import ProtectedRoute from '@components/ProtectedRoute';

// Authentication
import Login from '@layouts/authentication/Login';
import Register from '@layouts/authentication/Register';
import SocialCallback from '@layouts/authentication/SocialCallback';

// Seguradora
import SeguradoraDashboard from '@layouts/seguradora/pages/DashboardPage';
import SeguradoraLayout from '@layouts/seguradora/SeguradoraLayout';
import CorretoraDashboardPage from '@layouts/corretora/pages/DashboardPage';
import CorretoraLayout from '@layouts/corretora/CorretoraLayout';
import ListaSeguros from '@layouts/seguradora/pages/ListaSeguros';
import CriarSeguro from '@layouts/seguradora/pages/CriarSeguro';
import DetalhesSeguro from '@layouts/seguradora/pages/DetalhesSeguro';
import ListaCategorias from '@layouts/seguradora/pages/ListaCategorias';
import UsuariosPage from '@layouts/seguradora/pages/UsuariosPage';
import ListaClientes from '@layouts/seguradora/pages/ListaClientes';
import ListaApolices from '@layouts/seguradora/pages/ListaApolices';
import ListaPropostasPage from '@layouts/seguradora/pages/ListaPropostasPage';
import DetalhesPropostaPage from '@layouts/seguradora/pages/DetalhesPropostaPage';
import SinistrosSeguradoraPage from '@layouts/seguradora/pages/SinistrosPage';
import DetalhesSinistroPage from '@layouts/seguradora/pages/DetalhesSinistroPage';
import AuditoriaPage from '@layouts/seguradora/pages/AuditoriaPage';
import AgentesPage from '@layouts/seguradora/pages/AgentesPage';
import VerificacaoConta from '@layouts/seguradora/pages/VerificacaoConta';
import AdminRoute from '@components/AdminRoute';

// Corretora
import VerificacaoContaCorretora from '@layouts/corretora/pages/VerificacaoConta';

// Admin
import AdminLayout from '@layouts/admin/AdminLayout';
import AdminDashboard from '@layouts/admin/pages/DashboardPage';
import AdminSeguradoras from '@layouts/admin/pages/SeguradorasPage';
import AdminCorretoras from '@layouts/admin/pages/CorretorasPage';
import AdminUsers from '@layouts/admin/pages/UsersPage';
import AdminSystemSettings from '@layouts/admin/pages/SystemSettings';
import AdminAuditLogs from '@layouts/admin/pages/AuditLogs';

// Cliente
import ClienteDashboard from '@layouts/cliente/pages/Dashboard';
import VeiculosPage from '@layouts/cliente/pages/VeiculosPage';
import ContratarSeguroPage from '@layouts/cliente/pages/ContratarSeguroPage';
import ListaSeguradorasPage from '@layouts/cliente/pages/ListaSeguradorasPage';
import MinhasPropostasPage from '@layouts/cliente/pages/MinhasPropostasPage';
import MinhasApolices from '@layouts/cliente/pages/MinhasApolices';
import DetalhesApoliceCliente from '@layouts/cliente/pages/DetalhesApoliceCliente';
import PagamentosPage from '@layouts/cliente/pages/PagamentosPage';
import SinistrosClientePage from '@layouts/cliente/pages/SinistrosPage';
import ClienteLayout from '@layouts/cliente/Components/layouts/ClienteLayout'; // Temp path, will fix
import NotificacoesPage from '@layouts/shared/pages/NotificacoesPage';

import { ConfigProvider, theme as antdTheme } from 'antd';



 
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563EB', // Blue moderno
    },
    secondary: {
      main: '#10B981', // Verde suave
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
    },
  },
  typography: {
    fontFamily: '"Outfit", sans-serif',
    fontSize: 16,
    h1: { fontWeight: 800, color: '#0F172A', fontSize: '2.5rem' },
    h2: { fontWeight: 700, color: '#0F172A', fontSize: '2rem' },
    h3: { fontWeight: 700, color: '#0F172A', fontSize: '1.75rem' },
    h4: { fontWeight: 700, color: '#0F172A', fontSize: '1.5rem' },
    h5: { fontWeight: 600, color: '#0F172A', fontSize: '1.25rem' },
    h6: { fontWeight: 600, color: '#0F172A', fontSize: '1.15rem' },
    subtitle1: { fontWeight: 500, fontSize: '1.05rem' },
    subtitle2: { fontWeight: 500, fontSize: '0.95rem' },
    body1: { fontSize: '1.05rem' },
    body2: { fontSize: '0.95rem' },
    button: { fontWeight: 600, fontSize: '1rem' },
  },
  shape: {
    borderRadius: 16, // Bordas mais suaves
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          }
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
          border: '1px solid #E2E8F0',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
          border: '1px solid #E2E8F0',
        },
      },
    },
  },
});

// Landing page that redirects based on user role
const Home = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!user) {
    return <Navigate to="/register" replace />;
  }

  switch (user.perfil) {
    case 'seguradora':
      return <Navigate to="/seguradora/dashboard" replace />;
    case 'corretora':
      return <Navigate to="/corretora/dashboard" replace />;
    case 'cliente':
      return <Navigate to="/cliente/dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2563EB',
          borderRadius: 8,
          fontFamily: '"Outfit", sans-serif',
        },
        algorithm: antdTheme.defaultAlgorithm,
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/social-callback" element={<SocialCallback />} />

              {/* Home Route */}
              <Route path="/" element={<Home />} />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'super_admin_system']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="seguradoras" element={<AdminSeguradoras />} />
                <Route path="corretoras" element={<AdminCorretoras />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="settings" element={<AdminSystemSettings />} />
                <Route path="audit-logs" element={<AdminAuditLogs />} />
              </Route>

              {/* Seguradora Routes */}
              <Route
                path="/seguradora"
                element={
                  <ProtectedRoute allowedRoles={['seguradora']}>
                    <SeguradoraLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/seguradora/dashboard" replace />} />
                <Route path="dashboard" element={<SeguradoraDashboard />} />
                <Route path="seguros" element={<ListaSeguros />} />
                <Route path="seguros/criar" element={
                  <AdminRoute>
                    <CriarSeguro />
                  </AdminRoute>
                } />
                <Route path="seguros/:id" element={<DetalhesSeguro />} />

                <Route path="categorias" element={<ListaCategorias />} />
                <Route path="usuarios" element={
                  <AdminRoute>
                    <UsuariosPage />
                  </AdminRoute>
                } />
                <Route path="clientes" element={<ListaClientes />} />
                <Route path="apolices" element={<ListaApolices />} />
                <Route path="propostas" element={<ListaPropostasPage />} />
                <Route path="propostas/:id" element={<DetalhesPropostaPage />} />
                <Route path="sinistros" element={<SinistrosSeguradoraPage />} />
                <Route path="sinistros/:id" element={<DetalhesSinistroPage />} />
                <Route path="notificacoes" element={<NotificacoesPage />} />
                <Route path="auditoria" element={
                  <AdminRoute>
                    <AuditoriaPage />
                  </AdminRoute>
                } />
                <Route path="agentes" element={<AgentesPage />} />
                <Route path="perfil/verificacao" element={
                  <AdminRoute>
                    <VerificacaoConta />
                  </AdminRoute>
                } />
              </Route>

              {/* Corretora Routes */}
              <Route
                path="/corretora"
                element={
                  <ProtectedRoute allowedRoles={['corretora']}>
                    <CorretoraLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/corretora/dashboard" replace />} />
                <Route path="dashboard" element={<CorretoraDashboardPage />} />
                <Route path="perfil/verificacao" element={<VerificacaoContaCorretora />} />
                <Route path="notificacoes" element={<NotificacoesPage />} />
              </Route>

              {/* Cliente Routes */}
              <Route
                path="/cliente/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['cliente']}>
                    <ClienteDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cliente/seguradoras"
                element={
                  <ProtectedRoute allowedRoles={['cliente']}>
                    <ListaSeguradorasPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cliente/veiculos"
                element={
                  <ProtectedRoute allowedRoles={['cliente']}>
                    <VeiculosPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cliente/contratar"
                element={
                  <ProtectedRoute allowedRoles={['cliente']}>
                    <ContratarSeguroPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cliente/minhas-propostas"
                element={
                  <ProtectedRoute allowedRoles={['cliente']}>
                    <MinhasPropostasPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cliente/apolices"
                element={
                  <ProtectedRoute allowedRoles={['cliente']}>
                    <MinhasApolices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cliente/pagamentos"
                element={
                  <ProtectedRoute allowedRoles={['cliente']}>
                    <PagamentosPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cliente/sinistros"
                element={
                  <ProtectedRoute allowedRoles={['cliente']}>
                    <SinistrosClientePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cliente/apolices/:id"
                element={
                  <ProtectedRoute allowedRoles={['cliente']}>
                    <DetalhesApoliceCliente />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/cliente/notificacoes"
                element={
                  <ProtectedRoute allowedRoles={['cliente']}>
                    <NotificacoesPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
}

export default App;
