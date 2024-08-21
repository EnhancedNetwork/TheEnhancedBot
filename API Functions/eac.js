/**
 * @fileoverview This module provides functions to interact with the EAC part of The Enhanced Network API, 
 * including fetching user data by friend code or hashPUID, and managing user bans.
 * 
 * Dependencies:
 * - Requires the `constructURL` and `fetchData` functions from `utils.js`.
 * 
 * Constants:
 * - `ENDPOINT_URL`: Base URL for the EAC API endpoint.
 * 
 * @module EAC
 * @version 2.0.0
 * @since 2024-08-18
 * 
 * @author 0xDrMoe
 */

const { constructURL, fetchData } = require('./utils.js');
const ENDPOINT_URL = '/eac';

/**
 * Fetches all EAC users from the database.
 * 
 * @async
 * @function getAllEACUsers
 * @returns {Promise<Object>} A promise that resolves to an object containing all EAC users.
 */
async function getAllEACUsers() {
    const { url } = constructURL(ENDPOINT_URL);
    return await fetchData(url, { method: 'GET' });
}

/**
 * Fetches a user by their friend code from the database.
 * 
 * @async
 * @function getUserByFriendCode
 * @param {string} friendCode - The friend's code of the user to retrieve.
 * @returns {Promise<Object>} A promise that resolves to an object containing the user's data.
 */
async function getUserByFriendCode(friendCode) {
    const { url } = constructURL(ENDPOINT_URL, { friendcode: friendCode });
    return await fetchData(url, { method: 'GET' });
}

/**
 * Fetches a user by their hashPUID from the database.
 * 
 * @async
 * @function getUserByHashPUID
 * @param {string} hashPUID - The hashPUID of the user to retrieve.
 * @returns {Promise<Object>} A promise that resolves to an object containing the user's data.
 */
async function getUserByHashPUID(hashPUID) {
    const { url } = constructURL(ENDPOINT_URL, { hashPUID });
    return await fetchData(url, { method: 'GET' });
}

/**
 * Bans a user from the EAC platform.
 * 
 * @async
 * @function ban
 * @param {Object} data - The data of the user to ban, typically including identifiers like friend code or hashPUID.
 * @returns {Promise<Object>} A promise that resolves to an object containing the success or failure message.
 */
async function ban(data) {
    const { url, body } = constructURL(`${ENDPOINT_URL}/ban`, {}, data);
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body
    };
    return await fetchData(url, options);
}

/**
 * Unbans a user from the EAC platform.
 * 
 * @async
 * @function unban
 * @param {Object} data - The data of the user to unban, typically including identifiers like friend code or hashPUID.
 * @returns {Promise<Object>} A promise that resolves to an object containing the success or failure message.
 */
async function unban(data) {
    const { url, body } = constructURL(`${ENDPOINT_URL}/ban`, {}, data);
    const options = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: body
    };
    return await fetchData(url, options);
}

/* Do not touch this unless you know what you are doing */
module.exports = {
    getAllEACUsers,
    getUserByFriendCode,
    getUserByHashPUID,
    ban,
    unban
};
