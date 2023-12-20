const config = require(__dirname +'/config.json');

async function getAllUsers() {
    const fetchURL = `http://localhost:5000/eac/?token=${config.utils.TOKEN}`;
    let userInfo = await fetch(fetchURL, { method: 'GET' });
    userInfo = await userInfo.json();

    return userInfo;
}

async function getUserByID(id) {
    const fetchURL = `http://localhost:5000/userInfo?token=${config.utils.TOKEN}&uID=${id}`;
    let userInfo = await fetch(fetchURL, { method: 'GET' });
    userInfo = await userInfo.json();
    
    return userInfo;
}

/**
 * Create a new user in the database
 * @param {*} data - Full data object
 * @returns {Promise} { success, error }
 */
async function createUserByID(data) {
    
    const fetchURL = `http://localhost:5000/userInfo?token=${config.utils.TOKEN}`;
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

/**
 * Update a user's info in the database
 * @param {*} data - Full data object
 * @param {*} uID - Discord ID of user
 * @returns {Promise} { success, error }
 */
async function updateUserByID(data, uID) {
    console.log(data);
    const fetchURL = `http://localhost:5000/userInfo/?uID=${uID}&token=${config.utils.TOKEN}`;
    const fetchOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    };
    let userInfo = await fetch(fetchURL, fetchOptions);
    userInfo = await userInfo.json();

    console.log(`Updated user ${uID}`)
    return userInfo;
}

async function deleteUserByID(id) {
    const fetchURL = `http://localhost:5000/userInfo/${id}?token=${config.utils.TOKEN}`;
    let userInfo = await fetch(fetchURL, { method: 'DELETE' });
    userInfo = await userInfo.json();

    return userInfo;
}

async function getUserByFriendCode(friendCode) {
    const fetchURL = `http://localhost:5000/eac/?token=${config.utils.TOKEN}&friendcode=${friendCode}`;
    let userInfo = await fetch(fetchURL, { method: 'GET' });
    userInfo = await userInfo.json();

    return userInfo;
}

async function getUserByHashPUID(hashPUID) {
    const fetchURL = `http://localhost:5000/eac/?token=${config.utils.TOKEN}&hashPUID=${hashPUID}`;
    let userInfo = await fetch(fetchURL, { method: 'GET' });
    userInfo = await userInfo.json();

    return userInfo;
}

/**
 * Ban a user from TOHE (Add to EAC ban list)
 * @param {*} data - { name, reason, friendcode, hashpuid }
 * @returns {Promise} - { success, error }
 */
async function ban(data) {
    const fetchURL = `http://localhost:5000/eac/ban?token=${config.utils.TOKEN}`;
    const fetchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    };
    let userInfo = await fetch(fetchURL, fetchOptions);
    userInfo = await userInfo.json();

    return userInfo;
}

async function unban(data) {
    const fetchURL = `http://localhost:5000/eac/ban?token=${config.utils.TOKEN}`;
    const fetchOptions = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    };
    let userInfo = await fetch(fetchURL, fetchOptions);
    userInfo = await userInfo.json();

    return userInfo;
}

module.exports = {
    getAllUsers,
    getUserByID,
    createUserByID,
    updateUserByID,
    deleteUserByID,
    getUserByFriendCode,
    getUserByHashPUID,
    ban,
    unban,
}