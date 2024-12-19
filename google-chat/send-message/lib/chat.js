
const { google } = require('googleapis');

class ChatApi {
    scopes = [
        // 'https://www.googleapis.com/auth/chat.bot',
        // 'https://www.googleapis.com/auth/chat.app.memberships',
        // 'https://www.googleapis.com/auth/chat.admin.memberships',
        // 'https://www.googleapis.com/auth/chat.import',
        'https://www.googleapis.com/auth/chat.spaces',
        'https://www.googleapis.com/auth/chat.memberships',
        'https://www.googleapis.com/auth/chat.memberships.app',
        'https://www.googleapis.com/auth/chat.messages',
        'https://www.googleapis.com/auth/chat.messages.create',
    ]

    constructor(scopes) {
        if (scopes) {
            this.scopes = scopes;
        }
    }

    _preCheck() {
        if (!this.chat) {
            throw new Error('No auth provided');
        }
    }

    setAuth(auth) {
        this.chat = google.chat({ version: 'v1', auth });
    }

    async getSpaceList() {
        const res = await this.chat.spaces.list();
        return res.data;
    }

    async getSpaceMemberships(name) {
        const res = await this.chat.spaces.members.list({
            parent: name,
        });
        return res.data;
    }

    async sendMessage(space, text) {
        const res = await this.chat.spaces.messages.create({
            parent: space,
            requestBody: {
                text,
            },
        });
        return res.data;
    }

    async joinSpace(name, user) {
        const res = await this.chat.spaces.members.create({
            parent: name,
            requestBody: {
                state: 'JOINED', // 'INVITED',
                role: 'ROLE_MEMBER',
                member: {
                    name: user ?? 'users/app',
                    type: user ? 'HUMAN' : 'BOT',
                    // 'displayName': 'Bot',
                    // 'avatarUrl': 'https://example.com/avatar.png',
                }
            },
        });
        return res.data;
    }
}

module.exports = {
    ChatApi
}
