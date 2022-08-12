const { Command } = require("sheweny");
const { ApplicationCommandOptionType } = require("discord.js");

module.exports = class RWarnCommand extends Command {
  constructor(client) {
    super(client, {
      name: "warn-remove",
      description: "🔨 Remove um aviso de um usuário.",
      examples:
        "/warn-remove `usuario:@awoone#0001` `numero:2` => 🔨 Remove o aviso #2 do `@awoone#0001`",
      category: "Administrativos",
      userPermissions: ["ModerateMembers"],
      clientPermissions: ["ModerateMembers"],
      options: [
        {
          type: ApplicationCommandOptionType.User,
          name: "usuario",
          description: "👤 Usuário a ser removido o aviso",
          required: true,
        },
        {
          type: ApplicationCommandOptionType.Number,
          name: "numero",
          description: "🔢 O id do aviso a ser removido (veja /list-warns)",
          required: true,
        },
        {
          type: ApplicationCommandOptionType.String,
          name: "motivo",
          description: "❔ Motivo da remoção do aviso",
        },
      ],
    });
  }
  async execute(interaction) {
    if (!(await this.client.Defer(interaction))) return;
    const { guild, options } = interaction;

    const member = options.getMember("usuario");
    if (!member) return interaction.editReply(`\`🚫\` Não consigo encontrar esse usuário.`);
    const number = options.getNumber("numero");
    const reason = options.getString("motivo");

    const fetchGuild = await this.client.getGuild(guild);
    const logsChannel = this.client.channels.cache.get(fetchGuild.logs.channel);
    const enabledLogs = fetchGuild.logs.enabled;

    const filteredUser = fetchGuild.logs.users.filter(
      (u) => u.id === member.id
    );
    if (filteredUser.length === 0)
      return interaction.editReply(`\`🚫\` Este usuário não tem avisos.`);

    let index;
    try {
      index = filteredUser[number - 1].case;
    } catch (e) {
      return interaction.editReply(
        `\`🚫\` O aviso **#${number}** do ${member.toString()} não existe.`
      );
    }

    const filteredCase = fetchGuild.logs.users
      .map((u) => u.case)
      .indexOf(index);
    const oldReason = fetchGuild.logs.users[filteredCase].reason;
    fetchGuild.logs.users.splice(filteredCase, 1);
    await this.client.updateGuild(guild, {
      "logs.users": fetchGuild.logs.users,
    });

    interaction.editReply(
      `\`❎\` O aviso **#${number}** do ${member.toString()} foi removido.`
    );

    if (!logsChannel || !enabledLogs.includes("moderation")) return;
    logsChannel
      .send({
        embeds: [
          this.client
            .Embed()
            .setAuthor({
              name: `by ${interaction.user.tag}`,
              iconURL: interaction.user.displayAvatarURL({
                dynamic: true,
              }),
            })
            .setDescription(
              "Aviso do " +
                member.toString() +
                " foi removido.\n" +
                `➡️\`${oldReason}\``
            )
            .addFields({
              name: "Motivo",
              value: `${reason || "Nenhum motivo foi dado"}`,
            })
            .setThumbnail(member.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({
              text: member.user.tag + " - " + member.user.id,
            }),
        ],
      })
      .catch(() => undefined);
  }
};
