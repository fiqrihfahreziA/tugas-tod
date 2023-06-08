const mysql = require('mysql');

// Membuat koneksi dengan database MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Ganti dengan username MySQL Anda
  password: '', // Ganti dengan password MySQL Anda
  database: 'pp' // Ganti dengan nama database yang ingin Anda gunakan
});

// Membuka koneksi ke database MySQL
db.connect((err) => {
  if (err) {
    console.error('gak koneek: ', err);
    return;
  }
  console.log('konek');
});

module.exports = db;
