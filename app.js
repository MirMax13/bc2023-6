const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const fs = require("fs")
const YAML = require('yaml')

const app = express();
const port = 3000;
const file  = fs.readFileSync('./openapi.yaml', 'utf8')

// Генерація секретного ключа для сесій
const secretKey = crypto.randomBytes(32).toString('hex');
console.log(secretKey);

// Підключення до бази даних MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/Lab6', {
});

const db = mongoose.connection;

// Обробка помилок підключення до MongoDB
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
});
db.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Налаштування шаблонізатора та шляхів для статичних файлів
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Налаштування сесій
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
  }));

app.use(express.json());


const swaggerDocument = YAML.parse(file)


// Підключення маршрутів
app.use('/', routes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/public/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'script.js'));
});

// Маршрути
app.get('/', (req, res) => {
  res.render('main');
});

app.get('/Device', (req, res) => {
  res.render('Device');
});

app.get('/Take-Device', (req, res) => {
  res.render('Take Device');
});

app.get('/Register', (req, res) => {
  res.render('Register');
});

app.get('/Login', (req, res) => {
  res.render('Login');
});

// Прослуховування порту
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});