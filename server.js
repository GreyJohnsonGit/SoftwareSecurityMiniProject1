const express = require('express');
const app = express();

var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('./database.db');

const path = require(`path`);
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, './register.html'));
});

app.post('/', (req, res) => {
    console.log(req.body.username, req.body.password);

    db.all(`SELECT * FROM USERS WHERE USERNAME="${req.body.username}"`, function(err, row){
        if(row.length > 0)
            res.sendFile(path.join(__dirname, './dashboard.html'));
        else
            res.sendFile(path.join(__dirname, './login.html')); 
    });
});

app.post('/register', (req, res) => {
    console.log(req.body.username, req.body.password);

    const data = {
        username: req.body.username,
        password: req.body.password,
      }
      let sql = 'INSERT INTO USERS VALUES(?,?)';
      let params = [data.username, data.password];
      db.run(sql, params,(err, result) => {
          if(err)
            throw err;
          res.sendFile(path.join(__dirname, './dashboard.html'));
          console.log("Insert was successful")
      });
});

app.get('/users', function(request, response) {
    db.all('SELECT * FROM USERS', function(err, rows) {
            if(err) {
                    console.log("Error: " + err);
            }
            else {
                    response.send(rows);
            }
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});