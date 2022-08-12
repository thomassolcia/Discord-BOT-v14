const { Event } = require("sheweny");

module.exports = class clientMissingPermissionsEvent extends Event {
  constructor(client) {
    super(client, "clientMissingPermissions", {
      description: "Permissões do cliente ausentes.",
      emitter: client.managers.commands,
    });
  }

  async execute(interaction, missing) {
    interaction.reply({
      content: `Eu preciso das permissões \`${missing}\` para executar esse comando`,
      ephemeral: true,
    });
  }
};
