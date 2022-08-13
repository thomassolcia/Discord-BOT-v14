const { Command } = require("sheweny");
const { ApplicationCommandOptionType } = require("discord.js");

module.exports = class UnBanCommand extends Command {
  constructor(client) {
    super(client, {
      name: "desbanir",
      description: "🔪 Desbane um membro do servidor.",
      examples:
        "/desbanir `usuario:@awoone#0001` => 🔪 Desbane awoone do servidor.",
      category: "Administrativos",
      userPermissions: ["BanMembers"],
      clientPermissions: ["BanMembers"],
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: "usuario",
          description: "👤 ID do usuário a ser desbanido",
          required: true,
        },

        {
          type: ApplicationCommandOptionType.String,
          name: "motivo",
          description: "❔ Motivo do desbanimento",
        },
      ],
    });
  }

  async execute(interaction) {
    if (!(await this.client.Defer(interaction))) return;
    const { options, guild } = interaction;

    const memberId = options.getString("usuario");
    if (!memberId)
      return interaction.editReply(`\`🚫\` Não consigo encontrar esse usuário.`);
    const reason = options.getString("motivo");

    const fetchGuild = await this.client.getGuild(guild);
    const logsChannel = this.client.channels.cache.get(fetchGuild.logs.channel);
    const enabledLogs = fetchGuild.logs.enabled;

    try {
      await guild.members.unban(memberId, [
        `por ${interaction.member.user.tag}${reason ? ": " + reason : ""}`,
      ]);
    } catch (e) {
      return interaction.editReply(
        "`🚫` Este usuário não foi banido deste servidor."
      );
    }
    interaction.editReply(
      `\`🔪\` \`${memberId}\` foi desbanido do servidor.${
        reason ? `\n\n\n> Motivo: \`${reason}\`` : ""
      }`
    );

    if (!logsChannel || !enabledLogs.includes("moderation")) return;
    logsChannel
      .send({
        embeds: [
          this.client
            .Embed()
            .setAuthor({
              name: `por ${interaction.user.tag}`,
              iconURL: interaction.user.displayAvatarURL({
                dynamic: true,
              }),
            })
            .setDescription(`\`${memberId}\` foi desbanido.`)
            .addFields({
              name: "Reason",
              value: `${reason || "Nenhum motivo foi dado"}`,
            })
            .setColor("#b72a2a")
            .setTimestamp()
            .setFooter({
              text: memberId,
            }),
        ],
      })
      .catch(() => undefined);
  }
};
