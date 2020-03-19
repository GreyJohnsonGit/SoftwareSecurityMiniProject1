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
            res.redirect(`https://augmented-audio-270619.appspot.com/dashboard/${username}`)

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
          res.redirect(`https://augmented-audio-270619.appspot.com/dashboard/${data.username}`)
          console.log("Insert was successful")
      });
});

app.get('/csrf', (req, res) => {
    res.sendFile(path.join(__dirname, './csrf.html'));
});

app.post('/changepassword', (req, res) => {
    console.log(req.body.newPassword);

    const data = {
        newPassword: req.body.newPassword
      }
      let sql = 'UPDATE USERS SET password = ? WHERE username = ?';
      let params = [data.newPassword, 'admin'];
      db.run(sql, params,(err, result) => {
          if(err)
            throw err;
          res.redirect(`https://augmented-audio-270619.appspot.com/dashboard/${data.username}`)
          console.log("Password change was successful")
      });
});


//route to get all users
app.get('/users', function(request, response) {
    db.all('SELECT * FROM USERS', function(err, rows) {
            if(err) {
                    console.log("Error: " + err);
            }
            else {
                    response.writeHead(200, { 'Content-Type': 'text/html' });
                    response.write('<h1>USERS</h1>');
                    rows.forEach(user => {
                        response.write(`<p>${user.username}</p>`);
                    });
                    response.end();
            }
    });
});

app.get('/users/remove', function(request, response) {
    db.all('SELECT * FROM USERS', function(err, rows) {
            if(err) {
                    console.log("Error: " + err);
            }
            else {
                console.log(rows);
            }
    });
    response.sendFile(path.join(__dirname, './remove_user.html'));
});

//route to remove user
app.post('/users/remove', function(request, response) {
    console.log(request.body.username);
    let sql = `DELETE FROM USERS WHERE USERNAME="${request.body.username}"`;
    
    db.run(sql,(err, result) => {
        if(err)
          throw err;
        
        response.redirect(`https://augmented-audio-270619.appspot.com/users/remove`)
        
    });
    /*db.all('SELECT * FROM USERS', function(err, rows) {
            
    });*/
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});