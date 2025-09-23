# Shadcn commands

## Create project

```bash
npx shadcn@latest init
```

## Add button

```bash
npx shadcn@latest add button
# will create file in `components/ui/button.tsx'
```

- Command with non-existing component will throw an error

    ex. npx shadcn@latest add button2

    ```
    Something went wrong. Please check the error below for more details.
    If the problem persists, please open an issue on GitHub.

    Message:
    The item at https://ui.shadcn.com/r/styles/new-york-v4/button2.json was not found. It may not exist at the registry.

    Suggestion:
    Check if the item name is correct and the registry URL is accessible.
    ```

## List components provided by shadcn

```bash
npx shadcn@latest list @shadcn
```
