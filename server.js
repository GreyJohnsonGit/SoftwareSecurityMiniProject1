const express = require('express');
const app = express();

var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('./database.db');

const path = require(`path`);
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

//login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './login.html'));
});

//register page
app.get('/register*', (req, res) => {
    res.sendFile(path.join(__dirname, './register.html'));
});

//dashboard page
app.get('/dashboard*', (req, res) => {
    res.sendFile(path.join(__dirname, './dashboard.html'));
});

//authenticate user 
app.get('/login', (req, res) => {
    //console.log(req.body.username, req.body.password);

    let username = req.query.username;
    
    db.all(`SELECT * FROM USERS WHERE USERNAME="${username}"`, function(err, row){
        if(row.length > 0) {
            
            //res.sendFile(path.join(__dirname, './dashboard.html'));
            res.redirect(`http://localhost:8080/dashboard/${username}`)

        }
        else
            res.sendFile(path.join(__dirname, './login.html')); 
    });
});


//route to register user
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
          res.redirect(`http://localhost:8080/dashboard/${data.username}`)
          console.log("Insert was successful")
      });
});


//route to get all users
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