const { Command } = require("sheweny");
const { ApplicationCommandOptionType } = require("discord.js");

module.exports = class MuteCommand extends Command {
  constructor(client) {
    super(client, {
      name: "mute",
      type: "SLASH_COMMAND",
      description: "🔇Silencie um membro específico",
      examples:
        "/mute `usuario:@awoone#0001` `formato:minutos` `tempo:5` => 🔇Silencia `@awoone#0001` por `5` `minutos`",
      category: "Administrativos",
      userPermissions: ["ModerateMembers"],
      clientPermissions: ["ModerateMembers"],
      options: [
        {
          type: ApplicationCommandOptionType.User,
          name: "usuario",
          description: "👤 Usuário para silenciar",
          required: true,
        },
        {
          type: ApplicationCommandOptionType.String,
          name: "formato",
          description: "🕒 Formato a ser usado",
          required: true,
          choices: [
            {
              name: "🕒 Minutos",
              value: "minutos",
            },
            {
              name: "🕒 Horas",
              value: "horas",
            },
          ],
        },
        {
          type: ApplicationCommandOptionType.Integer,
          name: "tempo",
          description: "⏱️ Tempo a ser silenciado",
          required: true,
          minValue: 1,
          maxValue: 670,
        },
        {
          type: ApplicationCommandOptionType.String,
          name: "motivo",
          description: "❔ Motivo a ser silenciado",
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
    if (member.permissions.has("ManageGuild"))
      return interaction.editReply(`\`🚫\` Eu não posso silenciar este usuário.`);
    const format = options.getString("formato");
    const duration =
      format === "minutos"
        ? options.getInteger("tempo") * 60000
        : options.getInteger("tempo") * 3600000;
    const reason = options.getString("motivo");

    const fetchGuild = await this.client.getGuild(guild);
    const logsChannel = this.client.channels.cache.get(fetchGuild.logs.channel);
    const enabledLogs = fetchGuild.logs.enabled;

    try {
      member.timeout(
        duration,
        `por ${interaction.member.user.tag}${reason ? ": " + reason : ""}`
      );
    } catch (e) {
      return interaction.editReply(
        `\`⛔\` Ocorreu um erro: ${"```"}${
          e.message
        }${"```"}\nEntre em contato com o administrador do bot para obter ajuda.`
      );
    }
    interaction.editReply({
      content: `🔇 ${member.toString()} foi silenciado por ${this.client.PrettyMs(
        duration,
        { verbose: true }
      )}`,
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
            .setDescription(
              `${member.toString()} foi silenciado por \`${this.client.PrettyMs(
                duration
              )}\`\n\nPara desmutar, utilize \`/unmute\`.`
            )
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
