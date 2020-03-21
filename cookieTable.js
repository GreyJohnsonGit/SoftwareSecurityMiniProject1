const randomstring = require('randomstring');

let cookieTable = new Map();

module.exports.GenerateCookie = (_username) => {
    const userCookie = {
        username: _username,
        sessionID: randomstring.generate({
            length: 64,
            charset: 'alphanumeric'
        })
    };
    
    cookieTable.set(userCookie.username + userCookie.sessionID, userCookie.sessionID);
    return userCookie;
};

module.exports.EatCookie = (_cookie) => {
    cookieTable.delete(_cookie.username + _cookie.sessionID);
}

module.exports.CheckCookie = (_cookie) => {
    return cookieTable.has(_cookie.username + _cookie.sessionID);
}

module.exports.table = cookieTable;