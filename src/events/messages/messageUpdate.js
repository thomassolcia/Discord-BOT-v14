const { Event } = require("sheweny");

module.exports = class messageUpdateTracker extends Event {
  constructor(client) {
    super(client, "messageUpdate", {
      description: "Registra quando usuários modificam suas mensagens",
    });
  }

  async execute(oldMessage, newMessage) {
    const { guild, channel, member } = newMessage;
    if (newMessage.author.bot || newMessage.content == oldMessage.content)
      return;

    const fetchGuild = await this.client.getGuild(guild);
    const logsChannel = this.client.channels.cache.get(fetchGuild.logs.channel);
    const enabledLogs = fetchGuild.logs.enabled;

    if (logsChannel && enabledLogs.includes("msgEdit")) {
      const jumpTo =
        "https://discordapp.com/channels/" +
        guild.id +
        "/" +
        channel.id +
        "/" +
        newMessage.id;

      const embedInfo = this.client
        .Embed()
        .setAuthor({
          name: `${newMessage.author.username} editou uma mensagem.`,
          iconURL: member.user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(`[Mensagem editada](${jumpTo}) em ${channel.toString()}`)
        .addFields(
          {
            name: "Mensagem antiga" + ":",
            value: `${"```"}${oldMessage.content}${"```"}`,
          },
          {
            name: "Mensagem modificada" + ":",
            value: `${"```"}${newMessage.content}${"```"}`,
          }
        )
        .setColor("#FFA500")
        .setTimestamp()
        .setFooter({
          text: `${newMessage.author.tag} - ${member.user.id}`,
        });

      logsChannel.send({ embeds: [embedInfo] }).catch(() => undefined);
    }
  }
};
