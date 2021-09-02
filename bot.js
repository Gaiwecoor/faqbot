const {AugurClient} = require("augurbot"),
  config = require("./config.json"),
  u = require("./utils/utils");

const client = new AugurClient(config, {
  clientOptions: {
    allowedMentions: {
      repliedUser: false
    },
    partials: ["CHANNEL", "MESSAGE", "REACTION"]
  },
  commands: "./modules",
  errorHandler: u.errorHandler,
  parse: u.parse
});

client.login();

// LAST DITCH ERROR HANDLING
process.on("unhandledRejection", (error, p) => {
  client.errorHandler(error, "Unhandled Rejection");
});
process.on("uncaughtException", (error) => {
  client.errorHandler(error, "Uncaught Exception");
});

module.exports = client;
