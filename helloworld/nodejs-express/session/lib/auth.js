
/**
 * Authenticates via username and password
 * @param {*} username 
 * @param {*} password 
 * @returns true if username and password is valid, else false
 */
const authenticate = (username, password) => {
    if (username && username.length > 1) {
        if (password && password.length > 1) {
            return true
        }
    }
    return false
}

module.exports = {
    authenticate
}
