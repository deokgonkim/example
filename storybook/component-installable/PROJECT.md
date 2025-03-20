# Project creation

## Initialize project

```
npm init --scope @deokgonkim
```

- Start typescript project
```
npm install --save-dev typescript @types/node ts-node
```

- as tsup project
```
npm install --save-dev tsup typedoc
# create tsup.config.ts
```

- Install peer dependency react and styled-component
```
npm install --save-peer react@18.0.0 @types/react@18.0.0
npm install --save-peer styled-components@5.3.0 @types/styled-components@5.1.0
```

- Install storybook
```
npx storybook@8.0 init
```

## Publish

```bash
## Login before proceeding
# npm login
npm publish
```
