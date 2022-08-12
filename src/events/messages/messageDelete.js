const { Event } = require("sheweny");

module.exports = class messageDeleteTracker extends Event {
  constructor(client) {
    super(client, "messageDelete", {
      description: "Rastreia mensagens excluídas e grava logs",
    });
  }

  async execute(message) {
    const { guild, channel, member } = message;

    if (member == null || message.author.bot || message.embeds.length > 0)
      return;

    const fetchGuild = await this.client.getGuild(guild);
    const logsChannel = this.client.channels.cache.get(fetchGuild.logs.channel);
    const enabledLogs = fetchGuild.logs.enabled;

    if (logsChannel && enabledLogs.includes("msgDelete")) {
      let embed = this.client
        .Embed()
        .setAuthor({
          name: `${message.author.username} removeu uma mensagem.`,
          iconURL: member.user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(
          `Mensagem de <@${member.id}> em <#${channel.id}>\n
              ${
                message.content.length !== 0
                  ? `\`\`\`${message.content}\`\`\``
                  : ""
              }`
        )
        .setColor("#8B0000")
        .setTimestamp()
        .setFooter({
          text: `${message.author.tag} - ${member.user.id}`,
        });

      if (message.attachments.size > 0) {
        embed.addFields({
          name: "Attachments",
          value: message.attachments
            .map((attachment) => {
              return `[${attachment.name}](${attachment.url})`;
            })
            .join("\n"),
        });
      }

      return logsChannel
        .send({
          embeds: [embed],
        })
        .catch(() => undefined);
    }
  }
};
