const { Event } = require("sheweny");

module.exports = class guildDeleteEvent extends Event {
  constructor(client) {
    super(client, "guildDelete", {
      description: "Deixou o servidor",
    });
  }

  async execute(guild) {
    await this.client.deleteGuild(guild);
  }
};
