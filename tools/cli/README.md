# NEXIO Monorepo Cli

## Start

```bash
yarn nexio -h
```

### Run build command defined in package.json

```bash
yarn nexio i18n build
# or
yarn build -p i18n
```

### Run dev command defined in package.json

```bash
yarn nexio web dev
# or
yarn dev -p i18n
```

### Clean

```bash
yarn nexio clean --dist --rust
# clean node_modules
yarn nexio clean --node-modules
```

### Init

> Generate files that make the monorepo work properly, the per project codegen will not be included anymore

```bash
yarn nexio init
```

## Tricks

### Define scripts to run a .ts files without `--loader ts-node/esm/transpile-only`

`nexio run` will automatically inject `ts-node`'s transpile service(swc used) for your scripts

```json
{
  "name": "@nexio/demo",
  "scripts": {
    "dev": "node ./dev.ts"
  }
}
```

```bash
nexio @nexio/demo dev
```

or

```json
{
  "name": "@nexio/demo",
  "scripts": {
    "dev": "r ./src/index.ts"
  },
  "devDependencies": {
    "@nexio-tools/cli": "workspace:*"
  }
}
```

### Short your key presses

```bash
# af is also available for running the scripts
yarn af web build
```

#### by custom shell script

> personally, I use 'af'

create file `af` in the root of NEXIO project with the following content

```bash
#!/usr/bin/env sh
./tools/scripts/bin/runner.js nexio.ts $@
```

or on windows:

```cmd
node "./tools/cli/bin/runner.js" nexio.ts %*
```

and give it executable permission

```bash
chmod a+x ./af

# now you can run scripts with simply
./af web build
```

if you want to go further, but for vscode(or other forks) only, add the following to your `.vscode/settings.json`

```json
{
  "terminal.integrated.env.osx": {
    "PATH": "${env:PATH}:${cwd}"
  },
  "terminal.integrated.env.linux": {
    "PATH": "${env:PATH}:${cwd}"
  },
  "terminal.integrated.env.windows": {
    "PATH": "${env:PATH};${cwd}"
  }
}
```

restart all the integrated terminals and now you get:

```bash
af web build
```

```

```
