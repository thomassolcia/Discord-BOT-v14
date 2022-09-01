const { Event } = require("sheweny");

module.exports = class messageCreateTracker extends Event {
  constructor(client) {
    super(client, "messageCreate", {
      description: "Rastreia convites e apaga eles",
    });
  }

  async execute(message) {
    const { guild, channel, member } = message;

    if (!member || message.author.bot) return;

    if (
      (message.content.includes("discord.gg/") ||
        message.content.includes("discord.com/invite/")) &&
      !member.permissions.has("ManageMessages")
    ) {
      const fetchGuild = await this.client.getGuild(guild);
      const delDcInvitesState =
        fetchGuild.moderationTools.enabled.includes("delDcInvites");
      if (!delDcInvitesState) return;

      message.delete();

      const logsChannel = this.client.channels.cache.get(
        fetchGuild.logs.channel
      );
      const enabledLogs = fetchGuild.logs.enabled;

      if (logsChannel && enabledLogs.includes("moderation")) {
        return logsChannel
          .send({
            embeds: [
              this.client
                .Embed()
                .setAuthor({
                  name: `${message.author.username} enviou o link de um convite.`,
                  iconURL: member.user.displayAvatarURL({ dynamic: true }),
                })
                .setDescription(
                  `Mensagem enviada po <@${member.id}> apagada em <#${channel.id}>`
                )
                .addFields(
                  {
                    name: "\u200B",
                    value: `${"```"}${message.content}${"```"}`,
                  },
                  {
                    name: "Motivo" + ":",
                    value: "Link de convite",
                  }
                )
                .setColor("#ffcc4d")
                .setThumbnail(
                  "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/282/warning_26a0-fe0f.png"
                )
                .setTimestamp()
                .setFooter({
                  text: `${message.author.tag} - ${member.user.id}`,
                }),
            ],
          })
          .catch(() => undefined);
      }
    }
  }
};
