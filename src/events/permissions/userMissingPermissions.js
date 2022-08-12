const { Event } = require("sheweny");

module.exports = class userMissingPermissionsEvent extends Event {
  constructor(client) {
    super(client, "userMissingPermissions", {
      description: "Permissões do usuário ausentes.",
      emitter: client.managers.commands,
    });
  }

  async execute(interaction, missing) {
    interaction.reply({
      content: `Você precisa das permissões\`${missing}\` para executar esse comando`,
      ephemeral: true,
    });
  }
};
