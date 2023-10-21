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
  database: 'webapp-service-db'
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
app.set('view engine', 'ejs'); // Устанавливаем движок шаблонов EJS
app.set('views', path.join(__dirname, 'views')); // Устанавливаем папку с представлениями


app.use(express.static('uploads'));

// Главная страница

// Обработка создания статьи
app.post('/create-article', upload.array('image'), (req, res) => {
    // Получение данных из формы
    const title = req.body.title;
    const subtitle = req.body.subtitle;
    const content = req.body.content;
    const images = req.files;
    const link = req.body.link;

    // Выполнение запроса к базе данных
    const sql = 'INSERT INTO articles (title, subtitle, content, images, link) VALUES (?, ?, ?, ?, ?)';
    const values = [title, subtitle, content, JSON.stringify(images[0].path), link];
 
    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Ошибка выполнения запроса: ', err);
            return;
        }
        console.log('Статья успешно создана');
        res.send('Статья создана успешно!');
    });
});
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
app.get('/article', (req, res) => {
  const title = req.query.title;
  const subtitle = req.query.subtitle;
  const content = req.query.content;
  const images = req.query.images;
  const link = req.query.link;
  // Здесь можно передать данные статьи в представление и отобразить их

  res.render('article', { title: title, subtitle: subtitle, content: content, images: images, link: link });
});

// Маршрут для отображения списка статей
// Запуск сервера
app.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});