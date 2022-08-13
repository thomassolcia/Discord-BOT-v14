const { Command } = require("sheweny");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

module.exports = class SlowCommand extends Command {
  constructor(client) {
    super(client, {
      name: "slow",
      description: "🐌 Defina um slowmode para um canal.",
      examples:
        "/slow `canal:geral` `formato:minuto` `tempo:1` => 🕒 Define o slowmode para o canal geral para 1 minuto.",
      category: "Administrativos",
      userPermissions: ["ManageChannels"],
      clientPermissions: ["ManageChannels"],
      options: [
        {
          type: ApplicationCommandOptionType.Channel,
          name: "canal",
          description: "📙 Canal para definir o slowmode",
          required: true,
          channelTypes: [ChannelType.GuildText],
        },
        {
          type: ApplicationCommandOptionType.String,
          name: "formato",
          description: "🕒 Formato a ser utilizado",
          required: true,
          choices: [
            {
              name: "🕒 Segundos",
              value: "segundos",
            },
            {
              name: "🕒 Minutos",
              value: "minutos",
            },
          ],
        },
        {
          type: ApplicationCommandOptionType.Integer,
          name: "tempo",
          description: "⏱️ Defina o tempo do slowmode",
          required: true,
        },
        {
          type: ApplicationCommandOptionType.String,
          name: "motivo",
          description: "❔ Motivo do slowmode",
        },
      ],
    });
  }

  async execute(interaction) {
    if (!(await this.client.Defer(interaction))) return;
    const { options, guild } = interaction;

    const channel = options.getChannel("canal");
    if (!channel)
      return interaction.editReply(`\`🚫\` Não consigo encontrar este canal.`);

    const format = options.getString("formato");
    const time = options.getInteger("tempo");
    const reason = options.getString("motivo");

    const fetchGuild = await this.client.getGuild(guild);
    const logsChannel = this.client.channels.cache.get(fetchGuild.logs.channel);
    const enabledLogs = fetchGuild.logs.enabled;

    const formattedTime = format === "minutos" ? time * 60 : time;

    try {
      await channel.setRateLimitPerUser(
        formattedTime,
        `por ${interaction.member.user.tag}${reason ? ": " + reason : ""}`
      );
    } catch (e) {
      return interaction.editReply(
        "`🚫` Você não tem permissão para definir o slowmode neste canal."
      );
    }

    if (time === 0) {
      return interaction.editReply(
        `\`🐌\` ${channel.toString()} slowmode foi resetado.`
      );
    } else {
      interaction.editReply(
        `\`🐌\` ${channel.toString()} slowmode foi configurado para \`${time} ${format}\`\n\n> Utilize \`/unslow\` para desativar.`
      );
    }

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
            .setDescription(
              `${channel.toString()} slowmode foi configurado para \`${time} ${format}\`.`
              `${channel.toString()} ${
                time !== 0
                  ? `slowmode foi configurado para \`${time} ${format}\`\n\n Utilize \`/unslow\` para desativar`
                  : "slowmode foi configurado desativo"
              }.`
            )
            .addFields({
              name: "Reason",
              value: reason || "Nenhum motivo foi dado",
            })
            .setThumbnail(
              `${
                time !== 0
                  ? "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/microsoft/310/snail_1f40c.png"
                  : "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/313/rabbit_1f407.png"
              }`
            )
            .setTimestamp(),
        ],
      })
      .catch(() => undefined);
  }
};
