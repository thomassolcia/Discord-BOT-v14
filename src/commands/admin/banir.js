const { Command } = require("sheweny");
const { ApplicationCommandOptionType } = require("discord.js");

module.exports = class BanCommand extends Command {
  constructor(client) {
    super(client, {
      name: "banir",
      description: "🔪 Banir um membro do servidor.",
      examples: "/banir `usuario:@awoone#0001` `dias:3` => 🔪 Banir `@awoone#0001` do servidor e deletar suas mensagens dos últimos `3 dias`",
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
          type: ApplicationCommandOptionType.Integer,
          name: "dias",
          description: "❌ Dias para excluir as mensagens",
          required: true,
          min_value: 0,
          max_value: 7,
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
    const deleteDays = options.getInteger("dias");
    const reason = options.getString("motivo");

    const fetchGuild = await this.client.getGuild(guild);
    const logsChannel = this.client.channels.cache.get(fetchGuild.logs.channel);
    const enabledLogs = fetchGuild.logs.enabled;

    try {
      await member.ban({
        deleteMessageDays: deleteDays,
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
      `\`🔪\` ${member.toString()} foi banido do servidor.\n\n> \`${deleteDays}\` dias de mensagens também foram limpos${
        reason ? `\n> Motivo: \`${reason}\`` : ""
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
            .addFields(
              {
                name: "Mensagens deletadas",
                value: `${deleteDays} dias`,
              },
              {
                name: "Motivo",
                value: `${reason || "Nenhum motivo foi dado"}`,
              }
            )
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
