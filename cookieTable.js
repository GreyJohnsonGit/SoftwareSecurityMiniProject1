const randomstring = require('randomstring');

let cookieTable = new Map();
let cookieLife = 800000;

module.exports.GenerateCookie = (_username) => {
    const userCookie = {
        username: _username,
        sessionID: randomstring.generate({
            length: 64,
            charset: 'alphanumeric'
        }),
        birth: (new Date()).getTime()
    };
    
    cookieTable.set(userCookie.username, userCookie);
    return userCookie;
};

module.exports.EatCookie = (_cookie) => {
    cookieTable.delete(_cookie.username);
}

module.exports.CheckCookie = (_cookie) => {
    let result = cookieTable.get(_cookie.username);

    if(typeof result === 'undefined')
        return false;

    if(result.sessionID != _cookie.sessionID)
        return false;
    
    if(((new Date()).getTime() - result.birth) > cookieLife) {
            this.EatCookie(_cookie);
            return false;
    }
    
    return true;
}

module.exports.table = cookieTable;
module.exports.cookieLife = cookieLife;
