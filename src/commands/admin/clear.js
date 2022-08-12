const { Command } = require("sheweny");
const { ApplicationCommandOptionType } = require("discord.js");

module.exports = class ClearCommand extends Command {
  constructor(client) {
    super(client, {
      name: "clear",
      description: "⛑️ Limpar uma certa quantia de mensagens de um canal.",
      examples: "/clear `numero:5` => ⛑️ Exclui `5` mensagens em um canal",
      category: "Administrativos",
      userPermissions: ["Administrator"],
      clientPermissions: ["ManageMessages"],
      options: [
        {
          type: ApplicationCommandOptionType.Integer,
          name: "numero",
          description: "🔢 Número de mensagens a serem excluídas",
          required: true,
          min_value: 1,
          max_value: 100,
        },
      ],
    });
  }

  async execute(interaction) {
    if (!(await this.client.Defer(interaction))) return;

    const { options } = interaction;

    const number = options.getInteger("numero");

    return interaction.editReply({
      content: `\`❓\` Tem certeza de que deseja limpar **${number}** mensagens em ${interaction.channel.toString()}`,
      components: [
        this.client.ButtonRow([
          {
            customId: "confirm-clear",
            style: "SUCCESS",
            emoji: "✅",
          },
        ]),
      ],
    });
  }
};
