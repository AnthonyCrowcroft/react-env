import axios from "axios";

const NODE_ENV = process.env.NODE_ENV || "development";

function isBrowser() {
  return !!(typeof window !== "undefined" && window._env)
}

function getFiltered() {
  return Object.keys(process.env)
    .filter(key => /^REACT_APP_/i.test(key))
    .reduce(
      (env, key) => {
        env[key] = process.env[key];
        return env;
      },
      { NODE_ENV }
    );
}

export function env(key = "") {
  const safeKey = `REACT_APP_${key}`;
  if (isBrowser() && key === "NODE_ENV") {
    return window._env.NODE_ENV;
  }
  if (isBrowser()) {
    return key.length ? window._env[safeKey] : window._env;
  } 
  if (key === 'NODE_ENV') {
    return process.env.NODE_ENV;
  }
  return key.length ? process.env[safeKey] : getFiltered();
}

export async function bindEnvVariables() {
  await axios.get("/env.json", {responseType: "json"}).then((response) => {
    window._env = response.data;
  }).catch((error) => {
    console.log(error);
  })
}