const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const ejs = require('ejs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Создание подключения к базе данных
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'webapp-service-db',
  multipleStatements: true // Разрешает выполнение нескольких SQL-запросов в одном вызове
});

// Установка соединения с базой данных
connection.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных: ', err);
    return;
  }
  console.log('Подключение к базе данных успешно установлено');
});

// Настройка шаблонизатора EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('uploads'));

app.use(express.urlencoded({ extended: true })); // Парсинг данных формы

app.get('/', (req, res) => {
  const sql = 'SELECT * FROM articles';

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Ошибка выполнения запроса: ', err);
      return;
    }

    res.render('index', { articles: results });
  });
});

app.post('/create-article', upload.array('image'), (req, res) => {
  const title = req.body.title;
  const subtitle = req.body.subtitle;
  const content = req.body.content;
  const images = req.files;
  const link = req.body.link;

  const sql = 'INSERT INTO articles (title, subtitle, content, link) VALUES (?, ?, ?, ?)';
  const values = [title, subtitle, content, link];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('Ошибка выполнения запроса: ', err);
      return res.status(500).send('Ошибка выполнения запроса!');
    }

    const articleId = result.insertId;

    const imageSql = 'INSERT INTO images (article_id, file_name) VALUES (?, ?)';
    const imageValues = images.map((image) => [articleId, image.filename]);

    connection.query(imageSql, [imageValues], (err) => {
      if (err) {
        console.error('Ошибка выполнения запроса: ', err);
      }
    });

    res.redirect('/article?id=' + articleId);
  });
});

app.get('/article', (req, res) => {
  const articleId = req.query.id;

  const articleSql = 'SELECT * FROM articles WHERE id = ?';
  const imageSql = 'SELECT * FROM images WHERE article_id = ?';

  connection.query(articleSql, [articleId], (err, articleResult) => {
    if (err) {
      console.error('Ошибка выполнения запроса: ', err);
      return;
    }

    connection.query(imageSql, [articleId], (err, imageResults) => {
      if (err) {
        console.error('Ошибка выполнения запроса: ', err);
        return;
      }

      res.render('article', { article: articleResult[0], images: imageResults });
    });
  });
});

app.listen(3306, () => {
  console.log('Сервер запущен на порту 3306');
});