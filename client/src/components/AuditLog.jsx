import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || ''

export default function AuditLog() {
    const [logs, setLogs] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [actionFilter, setActionFilter] = useState('')
    const [loading, setLoading] = useState(true)
    const limit = 20

    const load = (p = page, action = actionFilter) => {
        setLoading(true)
        const params = new URLSearchParams({ page: p, limit })
        if (action) params.set('action', action)

        fetch(`${API}/api/admin/audit-logs?${params}`, { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                setLogs(data.logs || [])
                setTotal(data.total || 0)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }

    useEffect(() => { load(1) }, [])

    const handleFilterChange = (e) => {
        setActionFilter(e.target.value)
        setPage(1)
        load(1, e.target.value)
    }

    const totalPages = Math.ceil(total / limit)

    const formatDate = (d) => {
        const dt = new Date(d)
        return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
            ' ' + dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
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
        if (action.includes('logout')) return 'action-badge warning'
        return 'action-badge'
    }

    return (
        <div className="table-page">
            <div className="page-header">
                <div>
                    <h1>Audit Log</h1>
                    <p className="page-subtitle">{total} total events</p>
                </div>
                <div className="page-controls">
                    <select className="filter-select" value={actionFilter} onChange={handleFilterChange}>
                        <option value="">All Actions</option>
                        <option value="admin_login">Admin Login</option>
                        <option value="admin_logout">Admin Logout</option>
                        <option value="activate_account">Account Activated</option>
                        <option value="deactivate_account">Account Deactivated</option>
                    </select>
                </div>
            </div>

            <div className="data-table-wrap">
                {loading ? (
                    <div className="page-loading"><div className="loading-spinner" /></div>
                ) : logs.length === 0 ? (
                    <div className="empty-state">No audit log entries found.</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Action</th>
                                <th>Actor</th>
                                <th>Details</th>
                                <th>IP Address</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id}>
                                    <td className="cell-id">#{log.id}</td>
                                    <td>
                                        <span className={actionClass(log.action)}>
                                            {actionLabel(log.action)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="actor-badge">{log.actor_type}</span>
                                        <span className="actor-id">#{log.actor_id}</span>
                                    </td>
                                    <td className="cell-details">{log.details || '—'}</td>
                                    <td className="cell-ip">{log.ip_address || '—'}</td>
                                    <td className="cell-date">{formatDate(log.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button disabled={page <= 1} onClick={() => { setPage(p => p - 1); load(page - 1) }}>
                        ← Prev
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => { setPage(p => p + 1); load(page + 1) }}>
                        Next →
                    </button>
                </div>
            )}
        </div>
    )
}
