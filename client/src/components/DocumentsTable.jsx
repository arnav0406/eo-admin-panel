import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || ''

export default function DocumentsTable() {
    const [documents, setDocuments] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const limit = 15

    const load = (p = page, s = search) => {
        setLoading(true)
        fetch(`${API}/api/admin/documents?page=${p}&limit=${limit}&search=${encodeURIComponent(s)}`, { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                setDocuments(data.documents || [])
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

    const totalPages = Math.ceil(total / limit)

    return (
        <div className="table-page">
            <div className="page-header">
                <div>
                    <h1>Documents</h1>
                    <p className="page-subtitle">{total} uploaded PDF documents</p>
                </div>
                <div className="page-controls">
                    <input
                        type="text"
                        placeholder="Search by name, email, or owner..."
                        value={search}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="data-table-wrap">
                {loading ? (
                    <div className="page-loading"><div className="loading-spinner" /></div>
                ) : documents.length === 0 ? (
                    <div className="empty-state">No documents found.</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>User Name</th>
                                <th>User Email</th>
                                <th>Department</th>
                                <th>File</th>
                                <th>Owner</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map(doc => (
                                <tr key={doc.id}>
                                    <td className="cell-id">#{doc.id}</td>
                                    <td className="cell-name">{doc.name}</td>
                                    <td className="cell-email">{doc.email}</td>
                                    <td>{doc.department || '—'}</td>
                                    <td>
                                        <span className="file-badge">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                                <polyline points="14 2 14 8 20 8"/>
                                            </svg>
                                            PDF
                                        </span>
                                    </td>
                                    <td className="cell-owner">{doc.owner_name}</td>
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
