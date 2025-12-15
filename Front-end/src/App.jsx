import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from '@context/AuthContext';
import ProtectedRoute from '@components/ProtectedRoute';

// Authentication
import Login from '@layouts/authentication/Login';
import Register from '@layouts/authentication/Register';

// Seguradora
import SeguradoraDashboard from '@layouts/seguradora/Dashboard';

// Corretora
import CorretoraDashboard from '@layouts/corretora/Dashboard';

// Cliente
import ClienteDashboard from '@layouts/cliente/Dashboard';

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
    return <Navigate to="/login" replace />;
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
              path="/seguradora/dashboard"
              element={
                <ProtectedRoute allowedRoles={['seguradora']}>
                  <SeguradoraDashboard />
                </ProtectedRoute>
              }
            />

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

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
