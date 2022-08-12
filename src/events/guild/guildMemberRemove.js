const { Event } = require("sheweny");

module.exports = class guildMemberRemoveTracker extends Event {
  constructor(client) {
    super(client, "guildMemberRemove", {
      description: "Registra os usuários que saem do servidor",
    });
  }

  async execute(member) {
    const { guild } = member;
    const fetchGuild = await this.client.getGuild(guild);
    if (!fetchGuild) return;

    let logsChannel = null;
    try {
      logsChannel = this.client.channels.cache.get(fetchGuild.logs.channel);
    } catch (e) {}
    const enabledLogs = fetchGuild.logs.enabled;

    if (logsChannel && enabledLogs.includes("joinLeave")) {
      const searchRoles = member.roles.cache
        .filter((r) => r.id !== guild.id)
        .map((r) => r.toString())
        .join(", ");

      const embedInfo = this.client
        .Embed()
        .setAuthor({
          name: `${member.user.username} saiu do servidor.`,
          iconURL: member.user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(member.toString())

        .setColor("#8B0000")
        .setTimestamp()
        .setFooter({
          text: `${member.user.tag} - ${member.user.id}`,
        });

      if (searchRoles) {
        embedInfo.addFields({
          name: "🧮 " + "Cargos" + ":",
          value: searchRoles,
        });
      }

      if (member.joinedTimestamp) {
        embedInfo.addFields({
          name: "📥 " + "Entrou no servidor" + ":",
          value: `${this.client.Formatter(
            member.joinedTimestamp
          )} - ${this.client.Formatter(member.joinedTimestamp, "R")}`,
        });
      }

      logsChannel.send({ embeds: [embedInfo] }).catch(() => undefined);
    }

    if (fetchGuild.memberCount.channel) {
      this.client.UpdateMemberCount(
        guild,
        fetchGuild.memberCount.channel,
        fetchGuild.memberCount.name
      );
    }
  }
};
