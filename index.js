const express = require('express');
const app = express();
const cors = require('cors');
const mysql2 = require('mysql2');
const bodyParser = require('body-parser');

require('dotenv').config()

const db = mysql2.createConnection({
  host: 'localhost',
  user: process.env.USER_IN_DATABSE,
  password: process.env.PASSWORD,
  database: 'TABLEDataBase'
})

app.use(bodyParser.urlencoded({extended: true}))
app.use(cors());
app.use(express.json());

db.connect(function(err){
  if (err) {
    return console.error("Ошибка: " + err.message);
  }
  else{
    console.log("Подключение к серверу MySQL успешно установлено");
  }
});


app.post('/api/get/filterDataLength', (req, res) => {
  const { column, operation, value } = req.body;
  let sqlInsert;
  const additionalStr = 'COUNT(*)';
  switch(column){
    case 'number':
    case 'distance': {
      sqlInsert = `SELECT ${additionalStr} FROM travel WHERE ${column}${operation}${value}`;
      break;
    }
    case 'name': {
      sqlInsert = `SELECT ${additionalStr} FROM travel WHERE name LIKE LOWER('%${value}%')`;
      break;
    }
    default: break;
  }
  db.query(sqlInsert, (err, result) => {
    if(err) {
      res.send(err);
    } else {
      res.send({
        length: result[0][additionalStr],
      });
    }
  })
})

app.post('/api/post/filterData/numElementOnPage/:numElementOnPage/numPage/:numPage', (req, res) => {
  const { numElementOnPage, numPage } = req.params;
  const { column, operation, value } = req.body;

  let sqlInsert;

  const start = (numPage - 1) * numElementOnPage;
  const end = numElementOnPage;

  switch(column){
    case 'number':
    case 'distance': {
      sqlInsert = `SELECT * FROM travel WHERE ${column}${operation}${value} LIMIT ${start},${end}`;
      break;
    }
    case 'name': {
      sqlInsert = `SELECT * FROM travel WHERE name LIKE LOWER('%${value}%') LIMIT ${start},${end}`;
      break;
    }
    default: break;
  }

  db.query(sqlInsert, (err, result) => {
    if(err) {
      res.send(err);
    } else {
      res.send(result);
    }
  })
})

app.listen(3001, () => {
  console.log('runnung on port 3001');
})