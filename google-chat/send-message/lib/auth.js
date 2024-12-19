const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
// const { open } = require('open'); // ESM ONLY

const { OAuth2Client } = require('google-auth-library');


const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});


/**
 * 
 * @param {string[]} scopes 
 * @returns 
 */
const webLogin = async (scopes) => {
    const oAuth2Client = new OAuth2Client(
        CLIENT_ID,
        CLIENT_SECRET,
        'urn:ietf:wg:oauth:2.0:oob'
    );
    const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    });

    console.log('Authorize this app by visiting this url:', authorizeUrl);
    // open(authorizeUrl);

    return new Promise((resolve, reject) => {
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, async (err, token) => {
                if (err) return console.error('Error retrieving access token', err);
                fs.writeFileSync('token.json', JSON.stringify(token, null, 4));
                oAuth2Client.setCredentials(token);

                // jwt.fromJSON(oAuth2Client.credentials);
                resolve(oAuth2Client);
            });
        });
        
    });
}

/**
 * @param {string[]} scopes 
 * @returns 
 */
const oauth2Login = async (scopes) => {    
    if (fs.existsSync('token.json')) {
        const oAuth2Client = new OAuth2Client(
            CLIENT_ID,
            CLIENT_SECRET,
            'urn:ietf:wg:oauth:2.0:oob'
        );
        oAuth2Client.setCredentials(JSON.parse(fs.readFileSync('token.json')));
        return oAuth2Client;
    }
    
    return webLogin(scopes);
}

const serviceAccountLogin = async (scopes) => {
    const jwt = new google.auth.JWT({
        scopes,
    });
    jwt.fromJSON(JSON.parse(fs.readFileSync('service-account.json')));
    return jwt;
}

module.exports = {
    oauth2Login,
    serviceAccountLogin
}
