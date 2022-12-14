const { ShewenyClient } = require("sheweny");
const { Partials, GatewayIntentBits } = require("discord.js");
const { mongoose } = require("mongoose");
require("dotenv").config();
const { TOKEN, MONGO_URI, BOT_STATE } = process.env;

const client = new ShewenyClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember,
  ],
  admins: ["363422400488144896"],
  managers: {
    commands: {
      applicationPermissions: true,
      directory: "./src/commands",
      autoRegisterApplicationCommands: true,
      loadAll: true,
      default: {
        type: "SLASH_COMMAND",
        channel: "GUILD",
        cooldown: 3,
        userPermissions: ["UseApplicationCommands"],
      },
    },
    events: {
      directory: "./src/events",
      loadAll: true,
      default: {
        once: false,
      },
    },
    selectMenus: {
      directory: "./src/interactions/select-menus",
      loadAll: true,
    },
    buttons: {
      directory: "./src/interactions/buttons",
      loadAll: true,
    },
    modals: {
      directory: "./src/interactions/modals",
      loadAll: true,
    },
  },
  mode: BOT_STATE,
});

require("./src/util/functions")(client);

mongoose
  .connect(MONGO_URI, {
    autoIndex: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
  })
  .then(() => console.log("✅ MongoDB"))
  .catch((err) => console.error("❌ MongoDB\n", err.reason));

client.login(TOKEN);

module.exports = client;