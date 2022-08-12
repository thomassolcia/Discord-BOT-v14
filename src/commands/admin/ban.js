const { Command } = require("sheweny");
const { ApplicationCommandOptionType } = require("discord.js");

module.exports = class BanCommand extends Command {
  constructor(client) {
    super(client, {
      name: "ban",
      description: "🔪 Banir um membro do servidor.",
      examples: "/ban `user:@awoone#0001` => 🔪 Banir awoone do servidor.",
      category: "Administrativos",
      userPermissions: ["BanMembers"],
      clientPermissions: ["BanMembers"],
      options: [
        {
          type: ApplicationCommandOptionType.User,
          name: "usuario",
          description: "👤 Usuário para banir",
          required: true,
        },

        {
          type: ApplicationCommandOptionType.String,
          name: "motivo",
          description: "❔ Motivo do banimento",
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
      await member.ban({
        reason: `por ${interaction.member.user.tag}${
          reason ? ": " + reason : ""
        }`,
      });
    } catch (e) {
      return interaction.editReply(
        "`🚫` Você não tem permissão para banir este usuário."
      );
    }

    interaction.editReply(
      `\`🔪\` ${member.toString()} foi banido do servidor.${
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
            .setDescription(member.toString() + " foi banido.")
            .addFields({
              name: "Motivo",
              value: `${reason || "Nenhum motivo foi dado"}`,
            })
            .setThumbnail(member.displayAvatarURL({ dynamic: true }))
            .setColor("#b72a2a")
            .setTimestamp()
            .setFooter({
              text: member.user.tag + " - " + member.user.id,
            }),
        ],
      })
      .catch(() => undefined);
  }
};
