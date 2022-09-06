const { Command } = require("sheweny");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

module.exports = class LockCommand extends Command {
  constructor(client) {
    super(client, {
      name: "trancar",
      description: "🔒 Bloquear o canal atual.",
      examples:
        "/trancar `canal:#geral` => 🔒 Proibir usuários de enviar mensagens em #geral.",
      category: "Administrativos",
      userPermissions: ["ManageChannels"],
      clientPermissions: ["ManageChannels"],
      options: [
        {
          type: ApplicationCommandOptionType.Channel,
          name: "canal",
          description: "📙 Canal para bloquear",
          required: true,
          channelTypes: [ChannelType.GuildText],
        },
        {
          type: ApplicationCommandOptionType.String,
          name: "motivo",
          description: "❔ Motivo do bloqueio",
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
    const reason = options.getString("motivo");

    if (!channel.permissionsFor(guild.id).has("SendMessages")) {
      return interaction.editReply("`🚫` Este canal já está bloqueado.");
    }

    const fetchGuild = await this.client.getGuild(guild);
    const logsChannel = this.client.channels.cache.get(fetchGuild.logs.channel);
    const enabledLogs = fetchGuild.logs.enabled;

    try {
      await channel.permissionOverwrites.edit(guild.id, {
        SendMessages: false,
      });
    } catch (e) {
      return interaction.editReply(
        "`🚫` Você não tem permissão para bloquear este canal."
      );
    }

    interaction.editReply(
      `\`🔒\` O canal ${channel.toString()} foi bloqueado.\n\n> Utilize \`/destravar\` para desbloquear.`
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
            .setDescription(channel.toString() + " foi bloqueado.")
            .addFields({
              name: "Reason",
              value: `${reason || "Nenhum motivo foi dado"}`,
            })
            .setThumbnail(
              "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/322/locked_1f512.png"
            )
            .setColor("#ffac33")
            .setTimestamp(),
        ],
      })
      .catch(() => undefined);
  }
};
