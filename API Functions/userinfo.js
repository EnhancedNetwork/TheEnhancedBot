/**
 * @fileoverview This module provides functions to interact with the User Info section of The Enhanced Network API, 
 * including fetching all users with roles, retrieving, creating, updating, and deleting users by their unique IDs.
 * 
 * Dependencies:
 * - Requires the `constructURL` and `fetchData` functions from `utils.js`.
 * 
 * Constants:
 * - `ENDPOINT_URL`: Base URL for the User Info API endpoint.
 * 
 * @module UserInfo
 * @version 2.0.0
 * @since 2024-08-18
 * 
 * @author 0xDrMoe
 */

const { fetchData, constructURL } = require('./utils.js');
const ENDPOINT_URL = '/userInfo';

/**
 * Fetches all users with roles from the API.
 * 
 * @async
 * @function getAllRoleUsers
 * @returns {Promise<Object>} A promise that resolves to the response from the API, containing all users with roles.
 */
async function getAllRoleUsers() {
    const { url } = constructURL(ENDPOINT_URL);
    return await fetchData(url, { method: 'GET' });
}

/**
 * Fetches a user by their unique ID from the API.
 * 
 * @async
 * @function getUserByID
 * @param {string} uID - The unique ID of the user to retrieve.
 * @returns {Promise<Object>} A promise that resolves to the response from the API, containing the user data.
 */
async function getUserByID(uID) {
    const { url } = constructURL(`${ENDPOINT_URL}`, { uID });
    return await fetchData(url, { method: 'GET' });
}

/**
 * Creates a new user by their unique ID using the API.
 * 
 * @async
 * @function createUserByID
 * @param {Object} data - The data for the user to create.
 * @returns {Promise<Object>} A promise that resolves to the response from the API, indicating success or failure.
 */
async function createUserByID(data) {
    const { url, body } = constructURL(ENDPOINT_URL, {}, data);
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body
    };
    return await fetchData(url, options);
}

/**
 * Updates an existing user by their unique ID using the API.
 * 
 * @async
 * @function updateUserByID
 * @param {Object} data - The data for the user to update.
 * @param {string} uID - The unique ID of the user to update.
 * @returns {Promise<Object>} A promise that resolves to the response from the API, indicating success or failure.
 */
async function updateUserByID(data, uID) {
    const { url, body } = constructURL(ENDPOINT_URL, { uID }, data);
    const options = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: body
    };
    return await fetchData(url, options);
}

/**
 * Deletes a user by their unique ID using the API.
 * 
 * @async
 * @function deleteUserByID
 * @param {string} id - The unique ID of the user to delete.
 * @returns {Promise<Object>} A promise that resolves to the response from the API, indicating success or failure.
 */
async function deleteUserByID(id) {
    const { url } = constructURL(`${ENDPOINT_URL}/${id}`);
    return await fetchData(url, { method: 'DELETE' });
}

/* Do not touch this unless you know what you are doing */
module.exports = {
    getAllRoleUsers,
    getUserByID,
    createUserByID,
    updateUserByID,
    deleteUserByID
};
