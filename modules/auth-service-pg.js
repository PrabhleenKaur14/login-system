const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

let pool;

function sslConfig(){
  // Neon requires TLS; in coursework we can disable strict cert validation.
  return { rejectUnauthorized: false };
}

function mapUserRow(row, historyRows){
  return {
    userName: row.username,
    email: row.email,
    loginHistory: historyRows.map(h => ({
      dateTime: h.datetime,
      userAgent: h.useragent
    }))
  };
}

module.exports.initialize = function(){
  return new Promise(async (resolve, reject)=>{
    try{
      pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: +(process.env.DB_PORT || 5432),
        ssl: sslConfig()
      });

      // Create tables if missing
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
          userName TEXT PRIMARY KEY,
          password TEXT NOT NULL,
          email TEXT NOT NULL
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS login_history(
          id BIGSERIAL PRIMARY KEY,
          userName TEXT REFERENCES users(userName) ON DELETE CASCADE,
          dateTime TEXT,
          userAgent TEXT
        );
      `);

      resolve();
    }catch(err){
      reject(err);
    }
  });
};

module.exports.registerUser = function(userData){
  return new Promise(async (resolve, reject)=>{
    try{
      if(userData.password !== userData.password2){
        return reject("Passwords do not match");
      }
      const hash = await bcrypt.hash(userData.password, 10);

      await pool.query(
        `INSERT INTO users(userName, password, email) VALUES($1,$2,$3)`,
        [userData.userName, hash, userData.email]
      );

      resolve();
    }catch(err){
      if (err && err.code === '23505'){ // unique_violation
        reject("User Name already taken");
      } else {
        reject("There was an error creating the user: " + err);
      }
    }
  });
};

module.exports.checkUser = function(userData){
  return new Promise(async (resolve, reject)=>{
    try{
      const ures = await pool.query(`SELECT * FROM users WHERE userName=$1`, [userData.userName]);
      if(ures.rows.length === 0){
        return reject("Unable to find user: " + userData.userName);
      }
      const row = ures.rows[0];

      const ok = await bcrypt.compare(userData.password, row.password);
      if(!ok){
        return reject("Incorrect Password for user: " + userData.userName);
      }

      // Insert login record
      await pool.query(
        `INSERT INTO login_history(userName, dateTime, userAgent) VALUES($1,$2,$3)`,
        [row.username, (new Date()).toString(), userData.userAgent]
      );

      // Keep only last 8
      await pool.query(`
        DELETE FROM login_history
        WHERE userName=$1 AND id NOT IN (
          SELECT id FROM login_history
          WHERE userName=$1
          ORDER BY id DESC
          LIMIT 8
        )
      `, [row.username]);

      const hres = await pool.query(
        `SELECT id, dateTime, userAgent FROM login_history WHERE userName=$1 ORDER BY id DESC LIMIT 8`,
        [row.username]
      );

      resolve(mapUserRow(row, hres.rows));
    }catch(err){
      reject("There was an error verifying the user: " + err);
    }
  });
};