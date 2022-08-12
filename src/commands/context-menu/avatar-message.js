const { Command } = require("sheweny");

module.exports = class AvatarMessageContextMenuCommand extends Command {
  constructor(client) {
    super(client, {
      name: "Obter-Avatar-Mensagem",
      type: "CONTEXT_MENU_MESSAGE",
      description: "🖼️ Obtenha avatar de um usuário específico",
      examples: "Use o botão direito do mouse em uma mensagem -> `Apps` -> Obter-Avatar-Mensagem",
      category: "Menu de Contexto",
      userPermissions: ["SendMessages"],
      clientPermissions: ["SendMessages"],       
    });
  }

  async execute(interaction) {
    if (!(await this.client.Defer(interaction))) return;

    const message = await interaction.channel.messages.fetch(
      interaction.targetId
    );

    if (!message) return interaction.editReply(`❓Mensagem não encontrada`);

    return interaction.editReply({
      embeds: [
        this.client
          .Embed()
          .setDescription(message.author.toString())
          .setImage(
            message.author.displayAvatarURL({
              dynamic: true,
              format: "png",
              size: 512,
            })
          ),
      ],
    });
  }
};