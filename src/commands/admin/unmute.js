const { Command } = require("sheweny");
const { ApplicationCommandOptionType } = require("discord.js");

module.exports = class UnMuteCommand extends Command {
  constructor(client) {
    super(client, {
      name: "unmute",
      description: "🔊 Desmuta o som de um membro específico.",
      examples: "/unmute `membro:@awoone#0001` => 🔉 Desmuta `@awoone#0001`",
      category: "Administrativos",
      userPermissions: ["ModerateMembers"],
      clientPermissions: ["ModerateMembers"],
      options: [
        {
          type: ApplicationCommandOptionType.User,
          name: "usuario",
          description: "👤 Usuário para desmutar",
          required: true,
        },
        {
          type: ApplicationCommandOptionType.String,
          name: "motivo",
          description: "❔ Motivo para ser desmutado",
          required: false,
        },
      ],
    });
  }
  async execute(interaction) {
    if (!(await this.client.Defer(interaction))) return;
    const { guild, options } = interaction;

    const member = options.getMember("usuario");
    if (!member) return interaction.editReply(`\`🚫\` Não consigo encontrar esse usuário.`);
    const reason = options.getString("motivo");

    const fetchGuild = await this.client.getGuild(guild);
    const logsChannel = this.client.channels.cache.get(fetchGuild.logs.channel);
    const enabledLogs = fetchGuild.logs.enabled;

    if (!member.isCommunicationDisabled()) {
      return interaction.editReply(`\`🔊\` ${member.toString()} não está silenciado.`);
    }

    try {
      member.timeout(
        null,
        `por ${interaction.user.tag} ${reason ? ": " + reason : ""}`
      );
    } catch (e) {
      return interaction.editReply(
        `\`🚫\` Não consigo desmutar o ${member.toString()}.`
      );
    }
    interaction.editReply({
      content: `\`🔊\` ${member.toString()} não está mais silenciado.`,
    });

    if (!logsChannel || !enabledLogs.includes("moderation")) return;
    logsChannel
      .send({
        embeds: [
          this.client
            .Embed()
            .setAuthor({
              name: `por ${interaction.user.tag}`,
              iconURL: interaction.user.avatarURL({ dynamic: true }),
            })
            .setDescription(`${member.toString()} foi desmutado.`)
            .setFields({
              name: `Motivo` + ":",
              value: `${reason || "Nenhum motivo foi dado"}`,
              inline: true,
            })
            .setThumbnail(member.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setColor("#c97628")

            .setFooter({
              text: `${member.user.tag} - ${member.user.id}`,
            }),
        ],
      })
      .catch(() => undefined);
  }
};
