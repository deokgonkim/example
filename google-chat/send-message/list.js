const fs = require('fs');

const { oauth2Login, serviceAccountLogin } = require('./lib/auth');
const { ChatApi } = require('./lib/chat');

const main = async (auth_method, output_path) => {
    const chatApi = new ChatApi();
    if (auth_method == 'web') {
        const auth = await oauth2Login(chatApi.scopes);
        chatApi.setAuth(auth);
    } else {
        const auth = await serviceAccountLogin(chatApi.scopes);
        chatApi.setAuth(auth);
    }
    const spaces = await chatApi.getSpaceList();

    console.log(JSON.stringify(spaces, null, 2));
    fs.writeFileSync(`${output_path}/spaces.json`, JSON.stringify(spaces, null, 2));
    for (const space of spaces?.spaces) {
        const memberships = await chatApi.getSpaceMemberships(space.name);
        fs.writeFileSync(`${output_path}/${space.name.replace(/\//g, '_')}.json`, JSON.stringify(memberships, null, 2));
        console.log(JSON.stringify(memberships, null, 2));
    }
}

if (require.main === module) {
    const auth_method = process.argv[2] || 'web';
    const username = process.argv[3];
    if (!username) {
        console.log('Usage: npm run list <auth_method> <username>');
        process.exit(1);
    }
    if (!fs.existsSync(`output/${username}`)) {
        fs.mkdirSync(`output/${username}`, { recursive: true });
    }
    main(auth_method, `output/${username}`).catch(console.error).then(() => {
        console.log('done');
        process.exit(0);
    });
}

module.exports = {
    main
}