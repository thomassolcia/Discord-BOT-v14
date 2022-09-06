const { Command } = require("sheweny");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

module.exports = class UnlockCommand extends Command {
  constructor(client) {
    super(client, {
      name: "destrancar",
      description: "🔓 Desbloqueia o canal atual.",
      examples:
        "/destrancar `canal:#geral` => 🔓 Permita que os usuários enviem mensagens em #geral.",
      category: "Administrativos",
      userPermissions: ["ManageChannels"],
      clientPermissions: ["ManageChannels"],
      options: [
        {
          type: ApplicationCommandOptionType.Channel,
          name: "canal",
          description: "📙 Canal para desbloquear",
          required: true,
          channelTypes: [ChannelType.GuildText],
        },
        {
          type: ApplicationCommandOptionType.String,
          name: "motivo",
          description: "❔ Motivo do desbloqueio",
        },
      ],
    });
  }

  async execute(interaction) {
    const { options, guild } = interaction;
    if (!(await this.client.Defer(interaction))) return;

    const channel = options.getChannel("canal");
    if (channel.permissionsFor(guild.id).has("SendMessages")) {
      return interaction.editReply("`🚫` Este canal já está desbloqueado.");
    }
    const reason = options.getString("motivo");

    const fetchGuild = await this.client.getGuild(guild);
    const logsChannel = this.client.channels.cache.get(fetchGuild.logs.channel);
    const enabledLogs = fetchGuild.logs.enabled;

    try {
      await channel.permissionOverwrites.edit(guild.id, {
        SendMessages: true,
      });
    } catch (e) {
      return interaction.editReply(
        "`🚫` Você não tem permissão para desbloquear este canal."
      );
    }

    interaction.editReply(
      `\`🔓\` O canal ${channel.toString()} foi desbloqueado.`
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
            .setDescription(channel.toString() + " foi desbloqueado.")
            .addFields({
              name: "Motivo",
              value: reason || "Nenhum motivo foi dado",
            })
            .setThumbnail(
              "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/322/unlocked_1f513.png"
            )
            .setColor("#ffac33")

            .setTimestamp(),
        ],
      })
      .catch(() => undefined);
  }
};
