/**
 * @fileoverview This module provides functions to interact with the Tokens section of The Enhanced Network API, 
 * including fetching user tokens and sending requests to regenerate tokens.
 * 
 * Dependencies:
 * - Requires the `constructURL` and `fetchData` functions from `utils.js`.
 * 
 * Constants:
 * - `ENDPOINT_URL`: Base URL for the Tokens API endpoint.
 * 
 * @module Tokens
 * @version 2.0.0
 * @since 2024-08-18
 * 
 * @author 0xDrMoe
 */

const { fetchData, constructURL } = require('./utils.js');
const ENDPOINT_URL = '/tokens';

/**
 * Fetches a user token based on the provided ID and ownerID.
 * 
 * @async
 * @function getUserToken
 * @param {string} ID - The unique ID of the token.
 * @param {string} ownerID - The unique ID of the token's owner.
 * @returns {Promise<Object>} A promise that resolves to the response from the API, containing the token data.
 */
async function getUserToken(ID, ownerID) {
    const { url } = constructURL(ENDPOINT_URL, { ID, ownerID }, {});
    console.log(url);
    return await fetchData(url, { method: 'GET' });
}

/**
 * Sends a request to regenerate a user token based on the provided ID and ownerID.
 * 
 * @async
 * @function sendRegenerateTokenRequest
 * @param {string} ID - The unique ID of the token.
 * @param {string} ownerID - The unique ID of the token's owner.
 * @returns {Promise<Object>} A promise that resolves to the response from the API, indicating success or failure.
 */
async function sendRegenerateTokenRequest(ID, ownerID) {
    const { url } = constructURL(ENDPOINT_URL, { ID, ownerID }, {});
    return await fetchData(url, { method: 'PUT' });
}

/* Do not touch this unless you know what you are doing */
module.exports = {
    getUserToken,
    sendRegenerateTokenRequest
};
