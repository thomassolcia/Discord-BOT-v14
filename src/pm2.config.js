module.exports = {
  apps: [
    {
      name: "Awoone",
      script: "src/client.js",

      watch: "src",
      ignore_watch: [],

      env_production: {
        BOT_STATE: "production",
      },
      env_development: {
        BOT_STATE: "development",
      },

      watch_options: {
        followSymlinks: false,
      },
    },
  ],
};