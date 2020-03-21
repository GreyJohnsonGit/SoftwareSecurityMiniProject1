let cookieTable = new Map();

module.exports.GenerateCookie = (_username) => {
    const userCookie = {
        username: _username
    };
    
    cookieTable.set(userCookie.username, userCookie);
    return userCookie;
};

module.exports.EatCookie = (_cookie) => {
    cookieTable.delete(_cookie.username);
}

module.exports.CheckCookie = (_cookie) => {
    return cookieTable.has(_cookie.username);
}

module.exports.table = cookieTable;