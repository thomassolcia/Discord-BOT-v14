const { Command } = require("sheweny");

module.exports = class AvatarUserContextMenuCommand extends Command {
  constructor(client) {
    super(client, {
      name: "Obter-Avatar-Perfil",
      type: "CONTEXT_MENU_USER",
      description: "🖼️ Obtenha avatar de um usuário específico",
      examples: "Use o botão direito do mouse em uma usuário -> `Apps` -> Obter-Avatar-Perfil",
      category: "Menu de Contexto",
      userPermissions: ["SendMessages"],
      clientPermissions: ["SendMessages"],       
    });
  }
  async execute(interaction) {
    if (!(await this.client.Defer(interaction))) return;

    const user = interaction.options.getUser("user");

    if (!user) return interaction.editReply(`❓Usuário não encontrado`);

    return interaction.editReply({
      embeds: [
        this.client
          .Embed()
          .setDescription(user.toString())
          .setImage(
            user.displayAvatarURL({ dynamic: true, format: "png", size: 512 })
          ),
      ],
    });
  }
};