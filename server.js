//Routing Tools
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

//Database Tools
const mysql = require('promise-mysql');

//Security Tools
const bcrypt = require('bcrypt');
const saltRounds = 10;
const pepper = '0OpSI5p11tmIp3pp35';
const sqlstring = require('sqlstring');
const sanitizeHtml = require('sanitize-html');
const cookieTable = require('./cookieTable.js');

//Base URL for URLs
const baseURL = 'http://localhost:8080';

//Initialize Router
const app = express();

//Parse URI's and Cookies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

let db;
const createPool = async () => {
  db = await mysql.createPool({
    host: '35.229.114.54',
    user: 'root',
    password: 'root',
    database: 'myDB'
  });
};
createPool();

/*
*   Default Entry Point
*   A user will be redirected to their dashboard if they are logged in.
*   Otherwise, the user will be redirected to login.
*/
app.get('/', (req, res) => {
    if(req.cookies && req.cookies.userSession && cookieTable.CheckCookie(req.cookies.userSession)) {
        res.redirect(baseURL + '/dashboard');
    }
    else {
        res.redirect(baseURL + '/login');
    }
});

/*
*   Login Page
*   A user will be redirected to their dashboard if they are logged in.
*   Otherwise, they will be prompted to login.
*/ 
app.get('/login', (req, res) => {
    if(req.cookies && req.cookies.userSession && cookieTable.CheckCookie(req.cookies.userSession)) {
        res.redirect(baseURL + '/dashboard');
    }
    else {
        res.sendFile(path.join(__dirname, './login.html'));
    }
});

/*
*   Login Request
*   Services login requests.
*   If user credentials are valid, then the current userSession cookie is consumed and
*   a new cookie and session are generated.
*   If user credentials are invalid, then the page is refreshed.
*/
app.post('/login', (req, res) => {
    let username = '';
    let password = '';
    let sql = '';
    let userCookie = {};

    username = sanitizeHtml(req.body.username)
    password = req.body.password + pepper;

    sql = sqlstring.format("SELECT password FROM USERS WHERE username = ?", [username]);
    db.query(sql, (err, results) => {
        if(results.length && bcrypt.compareSync(password, results[0].password)) {
            if(req.cookies && req.cookies.userSession && cookieTable.CheckCookie(req.cookies.userSession)) {
                cookieTable.EatCookie(req.cookies.userSession);
            }
            res.clearCookie('userSession');
            userCookie = cookieTable.GenerateCookie(username);
            res.cookie('userSession', userCookie, {maxAge: cookieTable.cookieLife});
            res.redirect(baseURL + '/dashboard');
        }
        else {
            res.redirect(baseURL + '/login');
        }
    });    
});

/*
*   Register Page
*   A user will be redirected to their dashboard if they are logged in.
*   Otherwise, they will be prompted to register.
*/ 
app.get('/register', (req, res) => {
    if(req.cookies && req.cookies.userSession && cookieTable.CheckCookie(req.cookies.userSession)) {
        res.redirect(baseURL + '/dashboard');
    }
    else {
        res.sendFile(path.join(__dirname, './register.html'));
    }
});

/*
*   Register Request
*   Services registration requests.
*   If user credentials are valid, then the current userSession cookie is consumed,
*   a new cookie and session are generated, and user is added to db.
*   If user credentials are invalid, then the page is refreshed.
*/
app.post('/register', (req, res) => {
    let username = '';
    let password = '';
    let sql = '';
    let userCookie = {};

    username = sanitizeHtml(req.body.username);
    password = bcrypt.hashSync(req.body.password + pepper, saltRounds);

    sql = sqlstring.format('INSERT INTO USERS VALUES(?,?)', [username, password]);
    db.query(sql, (err, results) => {
        if(err) {
            if(err.code == 'SQLITE_CONSTRAINT') {
                res.sendFile(path.join(__dirname, './register.html'));
            }
            else {
                console.error(err);
            }
        }
        else {
            if(req.cookies && req.cookies.userSession && cookieTable.CheckCookie(req.cookies.userSession)) {
                cookieTable.EatCookie(req.cookies.userSession);
            }
            res.clearCookie('userSession');
            userCookie = cookieTable.GenerateCookie(username);
            res.cookie('userSession', userCookie, {maxAge: cookieTable.cookieLife});
            res.redirect(baseURL + '/dashboard');
        }
    });
});

/*
*   Dashboard
*   Presents Private Account Info
*   If user has a valid cookie, then user is allowed to acess their Dashboard Page.
*   If user has an invalid cookie or no cookie, then the user is redirected to login.
*/
app.get('/dashboard', (req, res) => {
    if(req.cookies && req.cookies.userSession && cookieTable.CheckCookie(req.cookies.userSession)) {
        res.sendFile(path.join(__dirname, './dashboard.html'));
    }
    else {
        res.redirect(baseURL + '/login');
    }
});

/*
*   Change Password Request
*   Changes Current Users Password
*   If user has valid cookie and password, then user's password is changed.
*   If user has invalid cookie or no cookie or invalid password, then user is 
*   redirected to dashboard (In uncommon cases, failure will kick user to login)
*/
app.post('/changepassword', (req, res) => {
    let username = '';
    let oldPassword = '';
    let newPassword = '';
    let sql = '';
    let userCookie = {};
    
    if(req.cookies && req.cookies.userSession && cookieTable.CheckCookie(req.cookies.userSession)) {
        username = sanitizeHtml(req.cookies.userSession.username);
    }
    else {
        res.redirect(baseURL + '/login');
    }
    oldPassword = req.body.oldPassword + pepper;
    newPassword = bcrypt.hashSync(req.body.newPassword + pepper, saltRounds);

    sql = sqlstring.format('SELECT password FROM USERS WHERE username = ?', username)
    db.query(sql, (err, results) => {
        if(results.length && bcrypt.compareSync(oldPassword, results[0].password)) {
            sql = sqlstring.format('UPDATE USERS SET password = ? WHERE username = ?', [newPassword, username]);
            db.query(sql, (err, result) => {
                if(!err){
                    if(req.cookies && req.cookies.userSession && cookieTable.CheckCookie(req.cookies.userSession)) {
                        cookieTable.EatCookie(req.cookies.userSession);
                    }
                    res.clearCookie("userSession");
                    userCookie = cookieTable.GenerateCookie(username);
                    res.cookie('userSession', userCookie, {maxAge: cookieTable.cookieLife});
                    res.redirect(baseURL + '/dashboard');
                }
            });
        }
    });
});

/*
*   Logout Request
*   Logs Out Active User
*   Deletes both user and server copies of session cookie and returns user
*   to login page.
*/
app.post('/logout', (req, res) => {
    if(req.cookies && req.cookies.userSession && cookieTable.CheckCookie(req.cookies.userSession)) {
        cookieTable.EatCookie(req.cookies.userSession);
    }
    res.clearCookie("userSession");
    res.redirect(baseURL + '/login');
});


/*
*   Users Page
*   Reveals All Site Members
*   If user has a valid cookie, then user is allowed to acess their Users Page.
*   If user has an invalid cookie or no cookie, then the user is redirected to login.
*/
app.get('/users', (req, res) => {
    db.query('SELECT username FROM USERS', (err, results) => {
        if(req.cookies && req.cookies.userSession && cookieTable.CheckCookie(req.cookies.userSession)) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write('<h1>Super Secret User List</h1>');
            results.forEach(user => {
                res.write(`<p>${user.username}</p>`);
            });
            res.write(`
            <form method="GET" action="/dashboard">
                <input type="submit" value="Back to Dashboard">
            </form>
            `);
            res.end();
        }
        else {
            res.redirect(baseURL + '/login');
        }
    });
});

//Start Listening for Requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
