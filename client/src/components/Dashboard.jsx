import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || ''

export default function Dashboard() {
    const [stats, setStats] = useState(null)
    const [recentLogs, setRecentLogs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            fetch(`${API}/api/admin/stats`, { credentials: 'include' }).then(r => r.json()),
            fetch(`${API}/api/admin/audit-logs?limit=8`, { credentials: 'include' }).then(r => r.json())
        ]).then(([statsData, logsData]) => {
            setStats(statsData)
            setRecentLogs(logsData.logs || [])
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    const formatDate = (d) => {
        const dt = new Date(d)
        return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
            ' ' + dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }

    const actionLabel = (action) => {
        const map = {
            admin_login: 'Admin Login',
            admin_logout: 'Admin Logout',
            activate_account: 'Account Activated',
            deactivate_account: 'Account Deactivated'
        }
        return map[action] || action
    }

    const actionClass = (action) => {
        if (action.includes('deactivate')) return 'action-badge danger'
        if (action.includes('activate')) return 'action-badge success'
        if (action.includes('login')) return 'action-badge info'
        return 'action-badge'
    }

    if (loading) {
        return <div className="page-loading"><div className="loading-spinner" /></div>
    }

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <h1>Dashboard</h1>
                <p className="page-subtitle">System overview and recent activity</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon accounts-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                        </svg>
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{stats?.totalAccounts ?? 0}</div>
                        <div className="stat-label">Total Accounts</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon users-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{stats?.totalUsers ?? 0}</div>
                        <div className="stat-label">Directory Users</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon docs-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{stats?.totalDocuments ?? 0}</div>
                        <div className="stat-label">PDF Documents</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon activity-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                        </svg>
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{stats?.recentActions ?? 0}</div>
                        <div className="stat-label">Actions (24h)</div>
                    </div>
                </div>
            </div>

            <div className="recent-section">
                <h2>Recent Activity</h2>
                {recentLogs.length === 0 ? (
                    <div className="empty-state">No recent activity recorded.</div>
                ) : (
                    <div className="activity-list">
                        {recentLogs.map(log => (
                            <div key={log.id} className="activity-item">
                                <div className={actionClass(log.action)}>
                                    {actionLabel(log.action)}
                                </div>
                                <div className="activity-details">
                                    {log.details || '—'}
                                </div>
                                <div className="activity-time">{formatDate(log.created_at)}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
