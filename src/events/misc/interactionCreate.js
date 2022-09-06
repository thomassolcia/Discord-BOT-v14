const { Event } = require("sheweny");

module.exports = class interactionCreateEvent extends Event {
  constructor(client) {
    super(client, "interactionCreate", {
      description: "nova interação",
    });
  }

  async execute(interaction) {
    const { guild } = interaction;

    let fetchGuild = await this.client.getGuild(guild);

    if (!fetchGuild) {
      await this.client.createGuild(guild);
      return this.client.channels.cache.get(guild.systemChannelId).send({
        content:
          "⚠️ O banco de dados foi redefinido, todos os dados deste servidor foram perdidos.\nDesculpe pelo inconveniente.\n\n`Servidor inicializado ✅`",
        components: [
          this.client.ButtonRow([
            {
              customId: "setup-menu",
              label: "Configurar",
              style: "SECONDARY",
              emoji: "🔧",
            },
          ]),
        ],
      });
    }

    guild.members.fetchMe().then((me) => {
      if (!me.permissions.has("Administrator")) {
        return interaction.reply({
          content:
            "`🚫` Eu preciso da permissão de `Administrador` para operar corretamente.",
          ephemeral: true,
        });
      }
    });
  }
};
