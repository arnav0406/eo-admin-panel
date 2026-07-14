// Seed the first admin account
// Usage: npm run seed
require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./db');

const ADMIN_EMAIL = 'admin@eoffice.gov.in';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'System Admin';

async function seed() {
    try {
        // Check if admin already exists
        const existing = await pool.query(
            'SELECT id FROM admin_accounts WHERE email = $1',
            [ADMIN_EMAIL]
        );

        if (existing.rows.length > 0) {
            console.log(`Admin "${ADMIN_EMAIL}" already exists. Skipping.`);
            process.exit(0);
        }

        const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
        await pool.query(
            'INSERT INTO admin_accounts (email, password_hash, display_name) VALUES ($1, $2, $3)',
            [ADMIN_EMAIL, hash, ADMIN_NAME]
        );

        console.log('Default admin account created:');
        console.log(`  Email:    ${ADMIN_EMAIL}`);
        console.log(`  Password: ${ADMIN_PASSWORD}`);
        console.log('\n⚠️  Change the password after first login!');
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err.message);
        process.exit(1);
    }
}

seed();
