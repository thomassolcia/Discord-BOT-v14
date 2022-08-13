const { Command } = require("sheweny");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

module.exports = class UnSlowCommand extends Command {
  constructor(client) {
    super(client, {
      name: "unslow",
      description: "🐇 Remove o slowmode de algum canal.",
      examples:
        "/unslow `canal:#geral` => 🕒 Remove o slowmode do canal `#geral`",
      category: "Administrativos",
      userPermissions: ["ManageChannels"],
      clientPermissions: ["ManageChannels"],
      options: [
        {
          type: ApplicationCommandOptionType.Channel,
          name: "canal",
          description: "📙 Canal que deseja remover o slowmode",
          required: true,
          channelTypes: [ChannelType.GuildText],
        },
        {
          type: ApplicationCommandOptionType.String,
          name: "motivo",
          description: "❔ Motivo para remover o slowmode",
        },
      ],
    });
  }
  async execute(interaction) {
    if (!(await this.client.Defer(interaction))) return;
    const { options, guild, member } = interaction;

    const channel = options.getChannel("canal");
    if (!channel)
      return interaction.editReply(`\`🚫\` Não consigo encontrar este canal.`);

    const reason = options.getString("motivo");

    const fetchGuild = await this.client.getGuild(guild);
    const logsChannel = this.client.channels.cache.get(fetchGuild.logs.channel);
    const enabledLogs = fetchGuild.logs.enabled;

    try {
      await channel.setRateLimitPerUser(
        0,
        `por ${member.user.tag}${reason ? ": " + reason : ""}`
      );
    } catch (e) {
      return interaction.editReply(
        "`🚫` Você não tem permissão para definir o slowmode neste canal."
      );
    }

    interaction.editReply(
      `\`🐇\` ${channel.toString()} slowmode foi resetado.`
    );

    if (!logsChannel || !enabledLogs.includes("channels")) return;
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
            .setDescription(`${channel.toString()} slowmode foi desativado.`)
            .addFields({
              name: "Motivo",
              value: reason || "Nenhum motivo foi dado",
            })
            .setThumbnail(
              "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/313/rabbit_1f407.png"
            )
            .setTimestamp(),
        ],
      })
      .catch(() => undefined);
  }
};