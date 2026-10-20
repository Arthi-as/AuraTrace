process.loadEnvFile('.env');
const pg = require('pg');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 8000 });
(async () => {
  const q = async (s) => (await pool.query(s)).rows;
  console.log('search_path', await q('show search_path'));
  console.log('migrations table', await q("select table_schema, table_name from information_schema.tables where table_name='schema_migrations' and table_schema='public'"));
  try { console.log('migrations rows', await q('select * from public.schema_migrations')); } catch (e) { console.log('migrations rows ERR', e.code, e.message); }
  console.log('user', await q("select id, email, name, left(password_hash, 24) as hash_prefix, created_at from public.users"));
  console.log('sessions', await q('select count(*)::int as n from public.sessions'));
  console.log('session rows', await q('select user_id, expires_at, created_at, ip from public.sessions order by created_at desc limit 5'));
})().catch((e) => { console.error('DBERR', e.code, e.message); process.exitCode = 1; }).finally(() => pool.end());
