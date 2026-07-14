import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || ''

function getCsrfToken() {
    const match = document.cookie.match(/(?:^|;\s*)admin_csrf_token=([^;]*)/)
    return match ? match[1] : ''
}

export default function AccountsTable() {
    const [accounts, setAccounts] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const limit = 15

    const load = (p = page, s = search) => {
        setLoading(true)
        fetch(`${API}/api/admin/accounts?page=${p}&limit=${limit}&search=${encodeURIComponent(s)}`, { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                setAccounts(data.accounts || [])
                setTotal(data.total || 0)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }

    useEffect(() => { load(1) }, [])

    const handleSearch = (e) => {
        setSearch(e.target.value)
        setPage(1)
        load(1, e.target.value)
    }

    const handleToggle = async (id) => {
        await fetch(`${API}/api/admin/accounts/${id}/toggle`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'X-CSRF-Token': getCsrfToken() }
        })
        load()
    }

    const totalPages = Math.ceil(total / limit)

    const formatDate = (d) => {
        if (!d) return '—'
        return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    return (
        <div className="table-page">
            <div className="page-header">
                <div>
                    <h1>Accounts</h1>
                    <p className="page-subtitle">{total} registered accounts</p>
                </div>
                <div className="page-controls">
                    <input
                        type="text"
                        placeholder="Search accounts..."
                        value={search}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="data-table-wrap">
                {loading ? (
                    <div className="page-loading"><div className="loading-spinner" /></div>
                ) : accounts.length === 0 ? (
                    <div className="empty-state">No accounts found.</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Users</th>
                                <th>Created</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map(acc => (
                                <tr key={acc.id}>
                                    <td className="cell-id">#{acc.id}</td>
                                    <td className="cell-name">{acc.display_name}</td>
                                    <td className="cell-email">{acc.email}</td>
                                    <td><span className="count-badge">{acc.user_count}</span></td>
                                    <td className="cell-date">{formatDate(acc.created_at)}</td>
                                    <td>
                                        <span className={`status-badge ${acc.is_active ? 'active' : 'inactive'}`}>
                                            {acc.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={`toggle-btn ${acc.is_active ? 'deactivate' : 'activate'}`}
                                            onClick={() => handleToggle(acc.id)}
                                        >
                                            {acc.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
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
