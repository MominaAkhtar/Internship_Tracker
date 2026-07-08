import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Context Providers
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

// Auth Route Guard
import { AuthGuard } from './components/common/AuthGuard';

// Shared Layout Template
import { Layout } from './components/layout/Layout';

// Screen Pages
import { Splash } from './pages/Splash';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { Applications } from './pages/Applications';
import { AddApplication } from './pages/AddApplication';
import { ViewApplication } from './pages/ViewApplication';
import { EditApplication } from './pages/EditApplication';
import { Insights } from './pages/Insights';
import { Notifications } from './pages/Notifications';
import { ActivityLogs } from './pages/ActivityLogs';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { ErrorPage } from './pages/ErrorPage';

export const App = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Splash />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected Workspace Layout Routes */}
              <Route
                path="/dashboard"
                element={
                  <AuthGuard>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </AuthGuard>
                }
              />
              <Route
                path="/applications"
                element={
                  <AuthGuard>
                    <Layout>
                      <Applications />
                    </Layout>
                  </AuthGuard>
                }
              />
              <Route
                path="/applications/new"
                element={
                  <AuthGuard>
                    <Layout>
                      <AddApplication />
                    </Layout>
                  </AuthGuard>
                }
              />
              <Route
                path="/applications/:id"
                element={
                  <AuthGuard>
                    <Layout>
                      <ViewApplication />
                    </Layout>
                  </AuthGuard>
                }
              />
              <Route
                path="/applications/:id/edit"
                element={
                  <AuthGuard>
                    <Layout>
                      <EditApplication />
                    </Layout>
                  </AuthGuard>
                }
              />
              <Route
                path="/insights"
                element={
                  <AuthGuard>
                    <Layout>
                      <Insights />
                    </Layout>
                  </AuthGuard>
                }
              />
              <Route
                path="/notifications"
                element={
                  <AuthGuard>
                    <Layout>
                      <Notifications />
                    </Layout>
                  </AuthGuard>
                }
              />
              <Route
                path="/activity"
                element={
                  <AuthGuard>
                    <Layout>
                      <ActivityLogs />
                    </Layout>
                  </AuthGuard>
                }
              />
              <Route
                path="/profile"
                element={
                  <AuthGuard>
                    <Layout>
                      <Profile />
                    </Layout>
                  </AuthGuard>
                }
              />
              <Route
                path="/settings"
                element={
                  <AuthGuard>
                    <Layout>
                      <Settings />
                    </Layout>
                  </AuthGuard>
                }
              />

              {/* Error Boundaries */}
              <Route path="/401" element={<ErrorPage code={401} />} />
              <Route path="/500" element={<ErrorPage code={500} />} />
              <Route path="/404" element={<ErrorPage code={404} />} />
              <Route path="*" element={<ErrorPage code={404} />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
