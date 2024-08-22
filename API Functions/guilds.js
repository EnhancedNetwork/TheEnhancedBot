/**
 * @fileoverview This module provides functions to interact with the Guilds section of The Enhanced Network API, 
 * including fetching all guilds, retrieving a guild by ID, and updating guild data.
 * 
 * Dependencies:
 * - Requires the `constructURL` and `fetchData` functions from `utils.js`.
 * 
 * Constants:
 * - `ENDPOINT_URL`: Base URL for the Guilds API endpoint.
 * 
 * @module Guilds
 * @version 2.0.0
 * @since 2024-08-18
 * 
 * @author 0xDrMoe
 */

const { fetchData, constructURL } = require('./utils.js');
const ENDPOINT_URL = '/guilds';

/**
 * Fetches all guilds from the API.
 * 
 * @async
 * @function getAllGuilds
 * @returns {Promise<Object>} A promise that resolves to the response from the API, containing all guilds.
 */
async function getAllGuilds() {
    const { url } = constructURL(ENDPOINT_URL);
    return await fetchData(url, { method: 'GET' });
}

/**
 * Fetches a guild by ID from the API.
 * 
 * @async
 * @function getGuild
 * @param {Snowflake} id - The ID of the guild to retrieve.
 * @returns {Promise<Object>} A promise that resolves to the response from the API, containing the guild data.
 */
async function getGuild(id) {
    const { url } = constructURL(`${ENDPOINT_URL}/${id}`);
    return await fetchData(url, { method: 'GET' });
}

/**
 * Creates a new guild using the API.
 * 
 * @async
 * @function createGuild
 * @param {Snowflake} ID - The ID of the guild to create.
 * @returns {Promise<Object>} A promise that resolves to the response from the API, indicating success or failure.
 */
async function createGuild(ID) {
    console.log('Creating guild with ID:', ID);
    const { url, body } = constructURL(ENDPOINT_URL, {}, { guildID: ID });
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body
    };
    return await fetchData(url, options);
}

/**
 * Updates a guild by ID using the API.
 * 
 * @async
 * @function updateGuild
 * @param {Object} data - The data of the guild to update. Must include `guildID`.
 * @returns {Promise<Object>} A promise that resolves to the response from the API, indicating success or failure.
 */
async function updateGuild(data) {
    const { url } = constructURL(`${ENDPOINT_URL}/${data.guildID}`, {}, data);
    const options = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    };
    return await fetchData(url, options);
}

// Export functions
module.exports = {
    getAllGuilds,
    getGuild,
    createGuild,
    updateGuild
};
