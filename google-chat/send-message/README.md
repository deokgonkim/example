# google chat api tested

## General Usage

```bash
# npm run list {AUTH_METHOD} {USERNAME}
npm run list web dgkim # uses Web OAuth2 Authentication
npm run list bot bot # uses Service Account Authentication using service-account.json
```

## List user

- Using `human` user
  ```bash
  npm run list web dgkim
  ```

- Using `bot` (list the spaces that this bot is joined)
  ```bash
  npm run list bot bot
  ```

## Invite bot to Channel

- **To invite chat `bot` to channel, then the chat bot must be published to MarketPlace**

- Set `SPACE_TO_JOIN` in `.env`
- Unset `USER_TO_JOIN` to use `user/app` and `BOT` as parameters.

```bash
npm run join web dgkim
```

## Invite user to Channel

- **To invite external user to the channel, the subscription must be `BUSINESS STARDARD` or higher**

- Set `SPACE_TO_JOIN` in `.env`
- Set `USER_TO_JOIN` in `.env`

```bash
npm run join web dgkim
```

## To send message

- Send message as a user through bot

```bash
npm run index web dgkim
```

- Send message as a bot (the bot must be invited to that channel)

```bash
npm run index bot bot
```
