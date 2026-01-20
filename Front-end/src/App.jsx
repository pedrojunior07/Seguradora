import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from '@context/AuthContext';
import ProtectedRoute from '@components/ProtectedRoute';

// Authentication
import Login from '@layouts/authentication/Login';
import Register from '@layouts/authentication/Register';

// Seguradora
import SeguradoraDashboard from '@layouts/seguradora/pages/DashboardPage';
import SeguradoraLayout from '@layouts/seguradora/SeguradoraLayout';
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
import AdminRoute from '@components/AdminRoute';

// Corretora
import CorretoraDashboard from '@layouts/corretora/Dashboard';

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

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
});

// Landing page that redirects based on user role
const Home = () => {
  const { user } = useAuth();

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
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Home Route */}
            <Route path="/" element={<Home />} />

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
            </Route>

            {/* Corretora Routes */}
            <Route
              path="/corretora/dashboard"
              element={
                <ProtectedRoute allowedRoles={['corretora']}>
                  <CorretoraDashboard />
                </ProtectedRoute>
              }
            />

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
  );
}

export default App;
