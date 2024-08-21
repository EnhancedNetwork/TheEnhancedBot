/**
 * @fileoverview This module provides utility functions for making API requests, 
 * including fetching data with error handling and constructing URLs with query parameters.
 * 
 * Dependencies:
 * - Requires the `path` module for file path operations.
 * - Requires the `config.json` file for configuration, such as API tokens.
 * - Requires the `node-fetch` package for making HTTP requests.
 * 
 * Constants:
 * - `API_BASE_URL`: The base URL for the API.
 * 
 * @module utils
 * @version 2.0.0
 * @since 2024-08-18
 * 
 * @author 0xDrMoe
 */

const path = require('path');
const config = require(path.join(__dirname, '../config.json'));
const API_BASE_URL = 'http://localhost:5000';

/**
 * Utility function to perform a fetch request with error handling.
 * 
 * @async
 * @function fetchData
 * @param {string} url - The endpoint URL.
 * @param {Object} options - Fetch options, including method, headers, and body.
 * @returns {Promise<Object>} A promise that resolves to the response data in JSON format, or an error object.
 */
async function fetchData(url, options) {
    try {
        // Dynamically import node-fetch
        const fetch = (await import('node-fetch')).default;
        
        // Make the fetch request
        const response = await fetch(url, options);
        
        // Parse the response JSON
        const data = await response.json();
        
        // Handle non-OK responses
        if (!response.ok && (response.status !== 409 && data.error !== 'Guild already exists')) {
            throw new Error(`API request failed: ${response.status} ${response.statusText} - ${data.error}`);
        }
        
        return data;
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error.message);
        if (error.cause && error.cause.code === 'ECONNREFUSED') {
            console.error('Connection refused. Please ensure the server is running and accessible.');
        }
        // Return a structured error object instead of throwing the error
        return { error: error.message };
    }
}

/**
 * Utility function to construct a URL with token and query parameters.
 * 
 * @function constructURL
 * @param {string} endpoint - The API endpoint.
 * @param {Object} [queryParams={}] - The query parameters as key-value pairs.
 * @param {Object} [bodyParams=null] - The body parameters (optional).
 * @returns {Object} An object containing the URL string and serialized body parameters (if provided).
 */
function constructURL(endpoint, queryParams = {}, bodyParams = null) {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    url.searchParams.append('token', config.utils.TOKEN);

    // Append query parameters to the URL
    Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });

    // Return the URL and body parameters separately
    return {
        url: url.toString(),
        body: bodyParams ? JSON.stringify(bodyParams) : null
    };
}

/* Do not touch this unless you know what you are doing */
module.exports = {
    fetchData,
    constructURL
};
