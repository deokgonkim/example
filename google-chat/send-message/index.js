// const open = require('open'); // ESM ONLY
const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

const { google } = require('googleapis');
const scopes = [
    // 'https://www.googleapis.com/auth/chat.bot',
    'https://www.googleapis.com/auth/chat.messages',
    'https://www.googleapis.com/auth/chat.messages.create',
];

const jwt = new google.auth.JWT({
    scopes,
});
// jwt.fromJSON(require('./credentials.json'));
const { OAuth2Client, auth } = require('google-auth-library');

const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'urn:ietf:wg:oauth:2.0:oob'
);

const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
});

console.log('Authorize this app by visiting this url:', authorizeUrl);
// open(authorizeUrl);

rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, async (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);

        // const chat = google.chat({ version: 'v1', auth: jwt });
        const chat = google.chat({ version: 'v1', auth: oAuth2Client });

        const res = await chat.spaces.messages.create({
            parent: 'spaces/AAAAi9yJZz0',
            requestBody: {
                text: 'Hello, World!',
            },
        });

        console.log(res.data);

        // jwt.fromJSON(oAuth2Client.credentials);
    });
});

const main = async () => {

}

// if (require.main === module) {
//     main().catch(console.error);
// }

module.exports = {
    main
}

