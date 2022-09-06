const { Command } = require("sheweny");

module.exports = class UserInfoContextMenuCommand extends Command {
  constructor(client) {
    super(client, {
      name: "Info-Usuario",
      type: "CONTEXT_MENU_USER",
      description: "📄 Obtenha informações sobre um usuário específico.",
      examples: "Use o botão direito do mouse em um usuário -> `Apps` -> Info-Usuario",
      category: "Menu de Contexto",
      userPermissions: ["SendMessages"],
      clientPermissions: ["SendMessages"],       
    });
  }
  async execute(interaction) {
    if (!(await this.client.Defer(interaction))) return;

    const { options } = interaction;
    const member = options.getMember("user");

    let userInfo = this.client
      .Embed()
      .setAuthor({
        name: member.user.tag,
        iconURL: member.user.displayAvatarURL({ dynamic: true }),
      })
      .addFields(
        {
          name: "📅 " + "Conta criada" + ":",
          value: `${this.client.Formatter(member.user.createdAt, "R")}`,
          inline: true,
        },
        {
          name: "📥 " + "Entrou no servidor" + ":",
          value: `${this.client.Formatter(member.joinedAt, "R")}`,
          inline: true,
        }
      );

    if (member.roles.cache.size > 1) {
      userInfo.addFields({
        name: "🧮 " + "Cargos" + ":",
        value: member.roles.cache
          .filter((r) => r.id !== member.guild.id)
          .map((r) => r.toString())
          .join(", "),
      });
    }

    if (member.presence.activities.length > 0) {
      const activityType = [
        "🎮 Jogando",
        "🎥 Transmitindo",
        "🎧 Ouvindo",
        "📺 Assistindo",
        "📝 Status Personalizado",
      ];

      member.presence.activities.forEach((activity) => {
        userInfo.addFields({
          name: activityType[activity.type],
          value: `${activity.name} ${
            activity.details ? `\n\`${activity.details}\`` : ""
          } ${activity.state ? `\n\`${activity.state}\`` : ""}`,
          inline: true,
        });
      });
    }

    return interaction.editReply({
      embeds: [userInfo],
    });
  }
};