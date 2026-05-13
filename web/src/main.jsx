import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './styles/index.css';
import { AuthProvider, useAuth } from './lib/auth.jsx';
import { AppShell } from './components/AppShell.jsx';
import { Login } from './pages/Login.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Units } from './pages/Units.jsx';
import { Checklist } from './pages/Checklist.jsx';
import { Tickets } from './pages/Tickets.jsx';
import { Announcements } from './pages/Announcements.jsx';
import { Projects } from './pages/Projects.jsx';
import { Onboarding } from './pages/Onboarding.jsx';
import { Drive } from './pages/Drive.jsx';

function Private({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <Private>
                <AppShell />
              </Private>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="unidades" element={<Units />} />
            <Route path="checklist" element={<Checklist />} />
            <Route path="chamados" element={<Tickets />} />
            <Route path="comunicados" element={<Announcements />} />
            <Route path="projetos" element={<Projects />} />
            <Route path="implantacao" element={<Onboarding />} />
            <Route path="disco" element={<Drive />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
