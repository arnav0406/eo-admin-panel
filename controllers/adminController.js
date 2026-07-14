const adminModel = require('../models/adminModel');

const getStats = async (req, res) => {
    try {
        const stats = await adminModel.getStats();
        res.json(stats);
    } catch (err) {
        console.error('Stats error:', err.message);
        res.status(500).json({ error: 'Failed to fetch statistics.' });
    }
};

const getAccounts = async (req, res) => {
    try {
        const search = req.query.search || '';
        const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
        const page = Math.max(Number(req.query.page) || 1, 1);
        const offset = (page - 1) * limit;

        const data = await adminModel.getAllAccounts(search, limit, offset);
        res.json({ ...data, page, limit });
    } catch (err) {
        console.error('Accounts error:', err.message);
        res.status(500).json({ error: 'Failed to fetch accounts.' });
    }
};

const toggleAccount = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid account ID.' });
        }

        const updated = await adminModel.toggleAccountActive(id);
        if (!updated) {
            return res.status(404).json({ error: 'Account not found.' });
        }

        // Log the toggle action
        await adminModel.createAuditLog({
            actorType: 'admin',
            actorId: req.adminId,
            action: updated.is_active ? 'activate_account' : 'deactivate_account',
            targetType: 'account',
            targetId: id,
            details: `${updated.is_active ? 'Activated' : 'Deactivated'} account "${updated.email}"`,
            ipAddress: req.ip
        });

        res.json(updated);
    } catch (err) {
        console.error('Toggle account error:', err.message);
        res.status(500).json({ error: 'Failed to update account.' });
    }
};

const getDocuments = async (req, res) => {
    try {
        const search = req.query.search || '';
        const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
        const page = Math.max(Number(req.query.page) || 1, 1);
        const offset = (page - 1) * limit;

        const data = await adminModel.getAllDocuments(search, limit, offset);
        res.json({ ...data, page, limit });
    } catch (err) {
        console.error('Documents error:', err.message);
        res.status(500).json({ error: 'Failed to fetch documents.' });
    }
};

const getAuditLogs = async (req, res) => {
    try {
        const action = req.query.action || '';
        const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);
        const page = Math.max(Number(req.query.page) || 1, 1);
        const offset = (page - 1) * limit;

        const data = await adminModel.getAuditLogs(action, limit, offset);
        res.json({ ...data, page, limit });
    } catch (err) {
        console.error('Audit logs error:', err.message);
        res.status(500).json({ error: 'Failed to fetch audit logs.' });
    }
};

module.exports = { getStats, getAccounts, toggleAccount, getDocuments, getAuditLogs };
