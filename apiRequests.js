const config = require('./config.json');

async function getUserByID(id) {
    const fetchURL = `http://localhost:3000/userInfo?token=${config.utils.TOKEN}&uID=${id}`;
    let userInfo = await fetch(fetchURL, { method: 'GET' });
    userInfo = await userInfo.json();
    
    return userInfo[0];
}

async function updateUserByID(data) {
    const fetchURL = `http://localhost:3000/userInfo?token=${config.utils.TOKEN}`;
    const fetchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    };
    let userInfo = await fetch(fetchURL, fetchOptions);
    userInfo = await userInfo.json();

    return userInfo.data;
}

async function deleteUserByID(id) {
    const fetchURL = `http://localhost:3000/userInfo/${id}?token=${config.utils.TOKEN}`;
    let userInfo = await fetch(fetchURL, { method: 'DELETE' });
    userInfo = await userInfo.json();

    return userInfo.data;
}

module.exports = {
    getUserByID,
    updateUserByID,
    deleteUserByID
}