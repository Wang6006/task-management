require('dotenv').config();
const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } = process.env;

// Validate required environment variables
if (!DB_HOST || !DB_USER || !DB_PASS || !DB_NAME) {
  console.error('Missing required database environment variables:');
  console.error('DB_HOST:', DB_HOST);
  console.error('DB_USER:', DB_USER);
  console.error('DB_PASS:', DB_PASS ? '[SET]' : '[MISSING]');
  console.error('DB_NAME:', DB_NAME);
  process.exit(1);
}

module.exports = {
  client: 'pg',
  connection: {
    host: DB_HOST,
    port: DB_PORT || 5432,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
  },
  pool: { min: 0, max: 10 },
  seeds: {
    directory: './seeds',
  },
};