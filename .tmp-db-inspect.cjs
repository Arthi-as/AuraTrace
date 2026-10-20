process.loadEnvFile('.env');
const pg = require('pg');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 8000 });
(async () => {
  const q = async (s) => (await pool.query(s)).rows;
  console.log('migrations', await q("select table_schema, table_name from information_schema.tables where table_name='schema_migrations'"));
  for (const t of ['users', 'sessions', 'notification_settings']) {
    console.log(t, await q(`select column_name,data_type,is_nullable,column_default from information_schema.columns where table_schema='public' and table_name='${t}' order by ordinal_position`));
  }
  console.log('users count', await q('select count(*)::int as n from public.users'));
  console.log('indexes', await q("select tablename,indexname,indexdef from pg_indexes where schemaname='public' and tablename in ('users','sessions','notification_settings') order by tablename,indexname"));
  console.log('triggers', await q("select event_object_table, trigger_name, action_timing, event_manipulation, action_statement from information_schema.triggers where event_object_schema='public'"));
  console.log('policies', await q("select tablename, policyname, roles, cmd, qual, with_check from pg_policies where schemaname='public'"));
})().catch((e) => { console.error('DBERR', e.code, e.message); process.exitCode = 1; }).finally(() => pool.end());
