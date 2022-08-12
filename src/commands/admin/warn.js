const { Command } = require("sheweny");
const { ApplicationCommandOptionType } = require("discord.js");

module.exports = class WarnCommand extends Command {
  constructor(client) {
    super(client, {
      name: "warn",
      description: "🔨 Avisa um usuário.",
      examples:
        "/warn `usuario:@awoone#0001` `motivo:algum motivo` => 🔨 Avisa o `@awoone#0001` por `algum motivo`",
      category: "Administrativos",
      userPermissions: ["ModerateMembers"],
      clientPermissions: ["ModerateMembers"],
      options: [
        {
          type: ApplicationCommandOptionType.User,
          name: "usuario",
          description: "👤 Usuário a ser avisado",
          required: true,
        },
        {
          type: ApplicationCommandOptionType.String,
          name: "motivo",
          description: "❔ Motivo do aviso",
          required: true,
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

    const userArray = fetchGuild.logs.users;
    const cases = fetchGuild.logs.users.map((u) => u.case);
    const highestCase = Math.max(...cases);

    let d = new Date();
    const user = {
      case: cases.length === 0 ? 0 : highestCase + 1,
      id: member.id,
      name: member.displayName,
      moderator: interaction.user.id,
      reason: reason,
      date: d.getTime(),
    };

    userArray.push(user);
    await this.client.updateGuild(guild, { "logs.users": userArray });

    interaction.editReply({
      content: `\`🔨\` ${member.toString()} foi avisado.`,
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
              `${member.toString()} foi avisado.\n\nUtilize, \`/warns-list\` para ver todos os avisos.`
            )
            .setFields({
              name: `Motivo` + ":",
              value: `${reason || "Nenhum motivo foi dado"}`,
              inline: true,
            })
            .setThumbnail(member.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({
              text: `${member.user.tag} - ${member.user.id}`,
            }),
        ],
      })
      .catch(() => undefined);
  }
};
