const { Command } = require("sheweny");
const { ApplicationCommandOptionType } = require("discord.js");

module.exports = class KickCommand extends Command {
  constructor(client) {
    super(client, {
      name: "expulsar",
      description: "🔪 Expulsar um usuário do servidor.",
      examples: "/expulsar `usuario:@awoone#0001` => 🔪 Expulsar awoone do servidor.",
      category: "Administrativos",
      userPermissions: ["KickMembers"],
      clientPermissions: ["KickMembers"],
      options: [
        {
          type: ApplicationCommandOptionType.User,
          name: "usuario",
          description: "👤 Usuário para expulsar",
          required: true,
        },

        {
          type: ApplicationCommandOptionType.String,
          name: "motivo",
          description: "❔ Motivo da expulsão",
        },
      ],
    });
  }

  async execute(interaction) {
    if (!(await this.client.Defer(interaction))) return;
    const { options, guild } = interaction;

    const member = options.getMember("usuario");
    if (!member) return interaction.editReply(`\`🚫\` Não consigo encontrar esse usuário.`);
    const reason = options.getString("motivo");

    const fetchGuild = await this.client.getGuild(guild);
    const logsChannel = this.client.channels.cache.get(fetchGuild.logs.channel);
    const enabledLogs = fetchGuild.logs.enabled;

    try {
      await member.kick(
        `por ${interaction.member.user.tag}${reason ? ": " + reason : ""}`
      );
    } catch (e) {
      return interaction.editReply(
        "`🚫` Você não tem permissão para expulsar este usuário."
      );
    }
    interaction.editReply(
      `\`🔪\` ${member.toString()} foi expulso do servidor.${
        reason ? `\n\n> Motivo: \`${reason}\`` : ""
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
            .setDescription(member.toString() + " foi expulso.")
            .addFields({
              name: "Motivo",
              value: `${reason || "Nenhum motivo foi dado"}`,
            })
            .setThumbnail(member.displayAvatarURL({ dynamic: true }))
            .setColor("#c97628")
            .setTimestamp()
            .setFooter({
              text: member.user.tag + " - " + member.user.id,
            }),
        ],
      })
      .catch(() => undefined);
  }
};
