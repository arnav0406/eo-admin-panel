const pool = require('../db');

// ─── Admin Account Queries ───

const getAdminByEmail = async (email) => {
    const result = await pool.query(
        'SELECT * FROM admin_accounts WHERE email = $1',
        [email]
    );
    return result.rows[0];
};

const getAdminById = async (id) => {
    const result = await pool.query(
        'SELECT id, email, display_name, created_at FROM admin_accounts WHERE id = $1',
        [id]
    );
    return result.rows[0];
};

// ─── Dashboard Stats ───

const getStats = async () => {
    const [accounts, users, documents, recentLogs] = await Promise.all([
        pool.query('SELECT COUNT(*)::int AS count FROM accounts'),
        pool.query('SELECT COUNT(*)::int AS count FROM users'),
        pool.query("SELECT COUNT(*)::int AS count FROM users WHERE resume_pdf IS NOT NULL AND resume_pdf != ''"),
        pool.query('SELECT COUNT(*)::int AS count FROM audit_logs WHERE created_at > NOW() - INTERVAL \'24 hours\'')
    ]);

    return {
        totalAccounts: accounts.rows[0].count,
        totalUsers: users.rows[0].count,
        totalDocuments: documents.rows[0].count,
        recentActions: recentLogs.rows[0].count
    };
};

// ─── Accounts Management ───

const getAllAccounts = async (search, limit, offset) => {
    let query = `
        SELECT a.id, a.email, a.display_name, a.is_active, a.created_at,
               COUNT(u.id)::int AS user_count
        FROM accounts a
        LEFT JOIN users u ON u.owner_id = a.id
    `;
    const params = [];
    
    if (search) {
        params.push(`%${search}%`);
        query += ` WHERE a.email ILIKE $${params.length} OR a.display_name ILIKE $${params.length}`;
    }

    query += ' GROUP BY a.id ORDER BY a.created_at DESC';

    params.push(limit);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*)::int AS count FROM accounts';
    const countParams = [];
    if (search) {
        countParams.push(`%${search}%`);
        countQuery += ` WHERE email ILIKE $1 OR display_name ILIKE $1`;
    }
    const countResult = await pool.query(countQuery, countParams);

    return {
        accounts: result.rows,
        total: countResult.rows[0].count
    };
};

const toggleAccountActive = async (id) => {
    const result = await pool.query(
        'UPDATE accounts SET is_active = NOT is_active WHERE id = $1 RETURNING id, email, display_name, is_active',
        [id]
    );
    return result.rows[0];
};

// ─── Documents Overview ───

const getAllDocuments = async (search, limit, offset) => {
    let query = `
        SELECT u.id, u.name, u.email, u.resume_pdf, u.department, u.role,
               a.display_name AS owner_name, a.email AS owner_email
        FROM users u
        JOIN accounts a ON a.id = u.owner_id
        WHERE u.resume_pdf IS NOT NULL AND u.resume_pdf != ''
    `;
    const params = [];

    if (search) {
        params.push(`%${search}%`);
        query += ` AND (u.name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR a.display_name ILIKE $${params.length})`;
    }

    query += ' ORDER BY u.id DESC';

    params.push(limit);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*)::int AS count FROM users u JOIN accounts a ON a.id = u.owner_id WHERE u.resume_pdf IS NOT NULL AND u.resume_pdf != ''`;
    const countParams = [];
    if (search) {
        countParams.push(`%${search}%`);
        countQuery += ` AND (u.name ILIKE $1 OR u.email ILIKE $1 OR a.display_name ILIKE $1)`;
    }
    const countResult = await pool.query(countQuery, countParams);

    return {
        documents: result.rows,
        total: countResult.rows[0].count
    };
};

// ─── Audit Logs ───

const getAuditLogs = async (action, limit, offset) => {
    let query = 'SELECT * FROM audit_logs';
    const params = [];

    if (action) {
        params.push(action);
        query += ` WHERE action = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    params.push(limit);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const result = await pool.query(query, params);

    let countQuery = 'SELECT COUNT(*)::int AS count FROM audit_logs';
    const countParams = [];
    if (action) {
        countParams.push(action);
        countQuery += ' WHERE action = $1';
    }
    const countResult = await pool.query(countQuery, countParams);

    return {
        logs: result.rows,
        total: countResult.rows[0].count
    };
};

const createAuditLog = async ({ actorType, actorId, action, targetType, targetId, details, ipAddress }) => {
    const result = await pool.query(
        'INSERT INTO audit_logs (actor_type, actor_id, action, target_type, target_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [actorType, actorId, action, targetType || null, targetId || null, details || null, ipAddress || null]
    );
    return result.rows[0];
};

module.exports = {
    getAdminByEmail,
    getAdminById,
    getStats,
    getAllAccounts,
    toggleAccountActive,
    getAllDocuments,
    getAuditLogs,
    createAuditLog
};
