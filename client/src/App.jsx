import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import AdminLogin from './components/AdminLogin'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import AccountsTable from './components/AccountsTable'
import DocumentsTable from './components/DocumentsTable'
import AuditLog from './components/AuditLog'

function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<AdminLogin />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            {(admin) => (
                                <Layout admin={admin}>
                                    <Dashboard />
                                </Layout>
                            )}
                        </ProtectedRoute>
                    } />
                    <Route path="/accounts" element={
                        <ProtectedRoute>
                            {(admin) => (
                                <Layout admin={admin}>
                                    <AccountsTable />
                                </Layout>
                            )}
                        </ProtectedRoute>
                    } />
                    <Route path="/documents" element={
                        <ProtectedRoute>
                            {(admin) => (
                                <Layout admin={admin}>
                                    <DocumentsTable />
                                </Layout>
                            )}
                        </ProtectedRoute>
                    } />
                    <Route path="/audit-log" element={
                        <ProtectedRoute>
                            {(admin) => (
                                <Layout admin={admin}>
                                    <AuditLog />
                                </Layout>
                            )}
                        </ProtectedRoute>
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    )
}

export default App

