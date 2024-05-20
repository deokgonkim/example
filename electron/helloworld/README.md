# electron-helloworld

## Install dependency

```
npm ci
```

## Run local development server

- start react dev server
    ```
    npm run start
    ```

- start electron app dev
    ```
    npm run electron-start
    ```

## Build distributable binary (tested only on linux)

```
npm run electron-pack
```

- Will create `dist/helloworld-0.1.0.AppImage`
- Will create `dist/linux-unpacked` directory containing binary `helloworld`

## Reference

- https://blog.codefactory.ai/electron/create-desktop-app-with-react-and-electron/1-project-setting/
