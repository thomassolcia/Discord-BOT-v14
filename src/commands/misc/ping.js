const { Command } = require("sheweny");

module.exports = class PingCommand extends Command {
  constructor(client) {
    super(client, {
      name: "ping",
      description: "🤖 Obtenha a latência do bot",
      examples: "/ping => 🏓Pong!",
      category: "Diversos",
      userPermissions: ["SendMessages"],
      clientPermissions: ["SendMessages"],       
    });
  }
  async execute(interaction) {
    const start = Date.now();
    if (!(await this.client.Defer(interaction))) return;
    const end = Date.now() - 500;
    const time = end - start;

    await interaction.editReply({
      embeds: [
        this.client
          .Embed()
          .setTitle("🏓 Pong!")
          .addFields(
            {
              name: "🤖 " + "Latência do Bot" + ":",
              value: `${"```"}${time}ms${"```"}`,
              inline: true,
            },
            {
              name: "🌐 " + "Latência da API" + ":",
              value: `${"```"}${interaction.client.ws.ping}ms${"```"}`,
              inline: true,
            }
          ),
      ],
    });
  }
};