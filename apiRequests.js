/** API Requests for TOHE
 * @module apiRequests
 * @version 1.0.0
 * @since 1.0.0
 * @see {@link https://tohre.dev/} for more information about TOHE
 * Below are all requests to the TOHE API
 * The API is used for The Enhanced Network. 
 * The Enhanced Network is a collection of services that are used to enhance the gaming experience for multiple games.
 * The API is used to store user information, such as Discord ID, role, and color.
 * The API is also used to store EAC ban information. This is used to ban users from the Town of Host: Enhanced Among Us Mod.
 * The API is also used to store referral codes for the Town of Host: Enhanced Ko-Fi.
 * All API requests require a token to be sent as a query parameter to the API. 
 * If you do not have a token, you can get one from the TOHE Discord server
 * All API requests return a promise with the response from the API request. The response is in JSON format. 
 * If the request was successful, the response will contain a success message and the data requested.
 * If the request was unsuccessful, the response will contain an error message.
 */

// Require the config file to get the token securely. Never share your token with anyone. 
// You are responsible for your any requests made with your token.
const config = require(__dirname + '/config.json');

/** userInfo 2.0.0
 * Below are userInfo API requests for the role_table
 * Use these functions to get, add, update, or delete users from the role_table
 * All functions return a promise with the response from the API request
 */

/**
 * Get all users in the role_table from the database
 * @returns {Result} 404 No users found, 200 All users
 */
async function getAllRoleUsers() {
    const fetchURL = `http://localhost:5000/userInfo/?token=${config.utils.TOKEN}`;
    const allUsers = await fetch(fetchURL, { method: 'GET' });
    console.log(`apiRequest: getAllRoleUsers: ${allUsers}`)
    return await allUsers.json();
}

/**
 * Get a user from the database by their Discord ID
 * @param {*} id - Discord ID of user
 * @returns {Result} 404 User not found, 200 User found
 */
async function getUserByID(id) {
    const fetchURL = `http://localhost:5000/userInfo?token=${config.utils.TOKEN}&uID=${id}`;
    let userByID = await fetch(fetchURL, { method: 'GET' });
    console.log(`apiRequest: getUserByID: ${userByID}`);
    return await userByID.json();
}

/**
 * Create a new user in the database
 * @param {*} data - Full data object of the user
 * @returns {Result} 201 User created, 400 Bad request
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
    const createdUser = await fetch(fetchURL, fetchOptions);
    console.log(`apiRequest: createUserByID: ${createdUser}`);
    return await createdUser.json();
}

/**
 * Update a user's info in the database
 * @param {*} data - Full data object of the user
 * @param {*} uID - Discord ID of user
 * @returns {Result} 200 User updated, 400 Bad request
 */
async function updateUserByID(data, uID) {
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

/**
 * Delete a user from the database
 * @param {*} id - Discord ID of user
 * @returns {Promise} { success, error }
 */
async function deleteUserByID(id) {
    const fetchURL = `http://localhost:5000/userInfo/${id}?token=${config.utils.TOKEN}`;
    let userInfo = await fetch(fetchURL, { method: 'DELETE' });
    userInfo = await userInfo.json();

    return userInfo;
}

/**
 * Below are EAC (Enhanced Anti-Cheat) API requests for the EAC ban list
 * Use these functions to get, add, or remove users from the EAC ban list
 */

/**
 * Get all users in the eac_list from the database
 * @returns {Promise} - { success, error }
 */
async function getAllEACUsers() {
    const fetchURL = `http://localhost:5000/eac/?token=${config.utils.TOKEN}`;
    let userInfo = await fetch(fetchURL, { method: 'GET' });
    userInfo = await userInfo.json();

    return userInfo;
}

/**
 * Get a user from the eac_list by their friend code from the database
 * @param {*} friendCode - Friend code of user
 * @returns {Promise} userInfo - { success, error }
 */
async function getUserByFriendCode(friendCode) {
    const fetchURL = `http://localhost:5000/eac/?token=${config.utils.TOKEN}&friendcode=${friendCode}`;
    let userInfo = await fetch(fetchURL, { method: 'GET' });
    userInfo = await userInfo.json();

    return userInfo;
}

/**
 * Get a user from the database by their hashPUID
 * @param {*} hashPUID - hashPUID of user
 * @returns {Promise} userInfo - { success, error }
 */
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

/**
 * Unban a user from TOHE (Remove from EAC ban list)
 * @param {*} data - { name, friendcode, hashpuid }
 * @returns {Promise} - { success, error }
 */
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

/**
 * Below are referralCode API requests for the referralCodes table
 * Use these functions to get, add, or remove referral codes from the referralCodes table
 */

/**
 * Get a referral code from the database by the code
 * @param {*} code - Referral code
 * @returns {Promise} userInfo - { success, error }
 */
async function getReferralByCode(code) {
    try {
        const fetchURL = `http://localhost:5000/referralcodes?token=${config.utils.TOKEN}&code=${code}`;
        let userInfo = await fetch(fetchURL, { method: 'GET' });
        userInfo = await userInfo.json();

        return userInfo[0];
    } catch (error) {
        console.log(error);
        return { error: error };
    }
}

/**
 * Get a referral code from the database by the user's ID
 * @param {*} id - Discord ID of user
 * @returns {Promise} userInfo - { success, error }
 */
async function getReferralByUserID(id) {
    try {
        const fetchURL = `http://localhost:5000/referralcodes?token=${config.utils.TOKEN}&userID=${id}`;
        let userInfo = await fetch(fetchURL, { method: 'GET' });
        userInfo = await userInfo.json();

        return userInfo[0];
    } catch (error) {
        console.log(error);
        return { error: error };
    }
}

/**
 * Get Top 10 Referral Codes
 */
async function getTopReferralCodes(type) {
    try {
        const fetchURL = `http://localhost:5000/referralcodes?token=${config.utils.TOKEN}&type=${type}`;
        let userInfo = await fetch(fetchURL, { method: 'GET' });
        userInfo = await userInfo.json();

        return userInfo;
    } catch (error) {
        console.log(error);
        return { error: error };
    }
}

/**
 * Create a new referral code in the database with the user's ID, code, points and uses
 * @param {*} data - { userID, code, points, uses }
 */
async function createReferralCode(data) {
    try {
        const fetchURL = `http://localhost:5000/referralcodes?token=${config.utils.TOKEN}`;
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
    } catch (error) {
        console.log(error);
        return { error: error };
    }
}

/**
 * Update a referral code in the database by the code and update the uses count by 1
 * @param {String} code - Referral code
 * @param {Int} uses - Uses count
 */
async function updateReferralCode(code, points) {
    try {
        const fetchURL = `http://localhost:5000/referralcodes?token=${config.utils.TOKEN}&code=${code}&points=${points}&increment=true`;
        const fetchOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
        };
        let userInfo = await fetch(fetchURL, fetchOptions);
        userInfo = await userInfo.json();

        return userInfo;
    } catch (error) {
        console.log(error);
        return { error: error };
    }
}

/**
 * All functions must be exported to be used in other files
 * @exports getAllRoleUsers - Get all users in the role_table from the database
 * @exports getUserByID - Get a user from the database by their Discord ID
 * @exports createUserByID - Create a new user in the database
 * @exports updateUserByID - Update a user's info in the database
 * @exports deleteUserByID - Delete a user from the database

 * @exports getAllEACUsers - Get all users in the eac_list from the database
 * @exports getUserByFriendCode - Get a user from the eac_list by their friend code from the database
 * @exports getUserByHashPUID - Get a user from the database by their hashPUID
 * @exports ban - Ban a user from TOHE (Add to EAC ban list)
 * @exports unban - Unban a user from TOHE (Remove from EAC ban list)
 * 
 * @exports getReferralByCode - Get a referral code from the database by the code
 * @exports getReferralByUserID - Get a referral code from the database by the user's ID
 * @exports getTopReferralCodes - Get Top 10 Referral Codes
 * 
 * @exports createReferralCode - Create a new referral code in the database with the user's ID, code, and points
 * @exports updateReferralCode - Update a referral code in the database by the code and update the uses count
 */
module.exports = {
    getAllRoleUsers,
    getAllEACUsers,
    getUserByID,
    createUserByID,
    updateUserByID,
    deleteUserByID,
    getUserByFriendCode,
    getUserByHashPUID,
    ban,
    unban,
    getReferralByCode,
    getReferralByUserID,
    getTopReferralCodes,
    createReferralCode,
    updateReferralCode
}