// Import required modules
const roleTypes = require('../roleTypes.json');
const { fetchData, constructURL } = require('../API Functions/utils.js');

// Create a Map to store role IDs and their names for quick lookup
const roleMap = new Map();

for (const category in roleTypes) {
    for (const roleKey in roleTypes[category]) {
        const role = roleTypes[category][roleKey];
        roleMap.set(role.roleID, role.name);
    }
}

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        try {
            // Compare the roles
            const oldRoles = oldMember.roles.cache;
            const newRoles = newMember.roles.cache;

            // Find the newly added roles
            const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
            
            // If roles were added, execute the added roles logic
            if (addedRoles.size > 0) {
                addedRoles.forEach(role => {
                    const roleName = roleMap.get(role.id);
                    if (roleName) {
                        console.log(`User ${newMember.user.tag} gained the role: ${roleName}`);
                    }
                });
                return; // Exit if roles were added
            }

            // Find the removed roles
            const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));

            // If roles were removed, execute the removed roles logic
            if (removedRoles.size > 0) {
                removedRoles.forEach(role => {
                    const roleName = roleMap.get(role.id);
                    if (roleName) {
                        console.log(`User ${newMember.user.tag} lost the role: ${roleName}`);
                    }
                });
                return; // Exit if roles were removed
            }

        } catch (error) {
            console.error(`Error in guildMemberUpdate event: ${error.message}`);
        }
    }
}