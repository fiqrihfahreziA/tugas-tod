const express = require('express');
const app = express();
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('./db');

app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Konfigurasi strategi passport
passport.use(
  new LocalStrategy((nama, nim, done) => {
    db.query('SELECT * FROM mahasiwa WHERE nama = ?', [nama], (err, results) => {
      if (err) {
        return done(err);
      }
      if (!results.length) {
        return done(null, false, { message: 'Incorrect nama.' });
      }
      const user = results[0];
      bcrypt.compare(nim, user.nim, (err, result) => {
        if (err) {
          return done(err);
        }
        if (!result) {
          return done(null, false, { message: 'Incorrect nim.' });
        }
        return done(null, user);
      });
    });
  })
);

// Konfigurasi serialisasi dan deserialisasi passport
passport.serializeUser((user, done) => {
  done(null, user.nama);
});

passport.deserializeUser((id, done) => {
  db.query('SELECT * FROM mahasiwa WHERE nama = ?', [nama], (err, results) => {
    if (err) {
      return done(err);
    }
    done(null, results[0]);
  });
});

// Middleware untuk memastikan pengguna sudah terautentikasi
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

app.get('/', ensureAuthenticated, (req, res) => {
  res.send('You are authenticated!');
});

app.get('/login', (req, res) => {
  res.send(`
  <head>
  <title>Login Page</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f0f2f5;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      padding: 0;
    }
    
    .container {
      max-width: 400px;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    
    .logo {
      text-align: center;
      margin-bottom: 20px;
    }
    
    .logo img {
      width: 150px;
    }
    
    .form-group {
      margin-bottom: 15px;
    }
    
    .form-group label {
      font-size: 14px;
      font-weight: 600;
    }
    
    .form-group input {
      width: 100%;
      padding: 10px;
      font-size: 16px;
      border: 1px solid #dddfe2;
      border-radius: 4px;
    }
    
    .form-group button {
      width: 100%;
      padding: 10px;
      font-size: 16px;
      color: #ffffff;
      background-color: #1877f2;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .form-group button:hover {
      background-color: #0f65db;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
    </div>
    <form action="/login" method="POST">
      <div class="form-group">
        <label for="username">nama</label>
        <input type="text" id="username" name="username" placeholder="Enter nama" required>
      </div>
      <div class="form-group">
        <label for="password">nim</label>
        <input type="password" id="password" name="password" placeholder="nim" required>
      </div>
      <div class="form-group">
        <button type="submit">Log In</button>
      </div>
    </form>
  </div>
</body>
  `);
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

// Mengaktifkan server untuk mendengarkan pada port tertentu
app.listen(3000, () => {
  console.log(`Server berjalan pada http://localhost:${3000}`);
});

