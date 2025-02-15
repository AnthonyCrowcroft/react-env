'use strict';

const spawn = require("cross-spawn");
const fs = require("fs");
const argv = require("minimist")(process.argv.slice(2));

const NODE_ENV = process.env.NODE_ENV || "development";

function writeBrowserEnvironment(env) {
  const basePath = fs.realpathSync(process.cwd());
  const destPath = argv.dest ? `${argv.dest}/` : "public/";
  const populate = JSON.stringify(env);
  fs.writeFileSync(`${basePath}/${destPath}env.json`, populate);
}

function getEnvironment() {
  return Object.keys(process.env)
    .filter(key => /^REACT_APP_/i.test(key))
    .reduce(
      (env, key) => {
        env[key] = process.env[key];
        return env;
      },
      { NODE_ENV: NODE_ENV }
    );
}

function resolveFile(file) {
  const path = fs.realpathSync(process.cwd());
  return `${path}/${file}`;
}

function getEnvFiles() {
  let appendFiles = [];
  if (argv.env) {
    if (typeof argv.env === "string") {
      appendFiles = [argv.env];
    } else {
      appendFiles = argv.env;
    }
  }
  return [
    ...appendFiles,
    resolveFile(`.env.${NODE_ENV}.local`),
    resolveFile(`.env.${NODE_ENV}`),
    NODE_ENV !== "test" && resolveFile(".env.local"),
    resolveFile(".env")
  ].filter(Boolean);
}

const dotenvFiles = getEnvFiles();

dotenvFiles.forEach(dotenvFile => {
  if (fs.existsSync(dotenvFile)) {
    require("dotenv-expand")(
      require("dotenv").config({
        path: dotenvFile
      })
    );
  }
});

const env = getEnvironment();

writeBrowserEnvironment(env);

if (argv._[0]) {
  spawn(argv._[0], argv._.slice(1), { stdio: "inherit" }).on("exit", function(
    exitCode
  ) {
    process.exit(exitCode);
  });
}
