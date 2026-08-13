const { Client } = require('pg');

async function testConnection() {
  const users = ['postgres', 'asim', 'Asim', 'admin'];
  const passwords = ['123456789', 'postgres', 'root', 'admin', 'password', '1234', '12345', '123456', 'asim'];
  
  for (const user of users) {
    for (const pwd of passwords) {
      const client = new Client({
        user,
        host: 'localhost',
        database: 'postgres',
        password: pwd,
        port: 5432,
      });
      try {
        await client.connect();
        console.log(`SUCCESS! User: "${user}", Password: "${pwd}"`);
        const res = await client.query('SELECT datname FROM pg_database;');
        console.log('Databases:', res.rows.map(r => r.datname));
        await client.end();
        return;
      } catch (err) {
        console.log(`[${user}:${pwd}] -> ${err.message}`);
      }
    }
  }
}

testConnection();
