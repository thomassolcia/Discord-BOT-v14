const { Command } = require("sheweny");
const { ApplicationCommandOptionType } = require("discord.js");

module.exports = class SetNicknameCommand extends Command {
  constructor(client) {
    super(client, {
      name: "nick",
      description: "✍️ Altera o apelido de um usuário.",
      examples:
        "/setnick `usuario:@awoone#0001` `apelido:awo` => ✍️ Altera o apelido do usuário @awoone#0001 para awo.",
      category: "Administrativos",
      userPermissions: ["ManageNicknames"],
      clientPermissions: ["ManageNicknames"],
      options: [
        {
          type: ApplicationCommandOptionType.User,
          name: "usuario",
          description: "👤 Usuário a ser alterado o apelido",
          required: true,
        },
        {
          type: ApplicationCommandOptionType.String,
          name: "apelido",
          description: "✏️ Novo apelido",
          required: true,
        },
        {
          type: ApplicationCommandOptionType.String,
          name: "motivo",
          description: "❔ Motivo de alteração do apelido",
        },
      ],
    });
  }

  async execute(interaction) {
    if (!(await this.client.Defer(interaction))) return;
    const { options, guild } = interaction;

    const member = options.getMember("usuario");
    if (!member) return interaction.editReply(`\`🚫\` Não consigo encontrar este usuário.`);
    const nickname = options.getString("apelido");
    const reason = options.getString("motivo");

    const fetchGuild = await this.client.getGuild(guild);
    const logsChannel = this.client.channels.cache.get(fetchGuild.logs.channel);
    const enabledLogs = fetchGuild.logs.enabled;

    try {
      await member.setNickname(
        nickname,
        `por ${interaction.member.user.tag}${reason ? ": " + reason : ""}`
      );
    } catch (e) {
      return interaction.editReply(
        "`🚫` Você não tem permissão para alterar o apelido deste usuário."
      );
    }
    interaction.editReply(
      `\`✍️\` O apelido do ${member.toString()} foi alterado para \`${nickname}\`.${
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
            .setDescription(
              `${member.toString()} o apelido foi alterado. \`${
                member.user.username
              } -> ${nickname}\``
            )
            .addFields({
              name: "Reason",
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
