# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 🔧 Environment Configuration

The project uses environment variables for WebSocket configuration in different environments:

### Development

Copy `.env.development` to `.env` for local development:

```sh
cp .env.development .env
```

Default development settings:
- WebSocket Protocol: `ws`
- Host: `localhost`
- Port: `4321`

### Production

Copy `.env.production.example` to `.env.production` and adjust values:

```sh
cp .env.production.example .env.production
```

Key environment variables:
- `PORT` - Server port (default: 8080)
- `VITE_HMR_PROTOCOL` - WebSocket protocol (ws/wss)
- `VITE_HMR_HOST` - WebSocket host
- `VITE_HMR_PORT` - WebSocket port
- `VITE_HMR_CLIENT_PORT` - Client port (if behind proxy)
- `VITE_HMR_PATH` - WebSocket path
- `VITE_WS_PROXY_TARGET` - WebSocket proxy target
- `VITE_WS_SECURE` - Use secure WebSocket
- `VITE_USE_POLLING` - Use polling for file watching

### Proxy Configuration

When running behind a proxy:
1. Set `VITE_HMR_PROTOCOL=wss`
2. Configure `VITE_HMR_HOST` to your domain
3. Set `VITE_HMR_PORT` and `VITE_HMR_CLIENT_PORT` to 443
4. Enable secure WebSocket with `VITE_WS_SECURE=true`
5. Set `VITE_HMR_PATH=/ws` for proxy path

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
