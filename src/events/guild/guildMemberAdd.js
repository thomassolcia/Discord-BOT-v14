const { Event } = require("sheweny");

module.exports = class guildMemberAddTracker extends Event {
  constructor(client) {
    super(client, "guildMemberAdd", {
      description: "Registra novos usuários e contas da blacklist criadas em 24h",
      once: false,
    });
  }

  async execute(member) {
    const { guild } = member;
    let autoRoleSystem = true;

    const fetchGuild = await this.client.getGuild(guild);
    const logsChannel = this.client.channels.cache.get(fetchGuild.logs.channel);
    const enabledLogs = fetchGuild.logs.enabled;

    if (logsChannel && enabledLogs.includes("joinLeave")) {
      let warn = false;
      const blacklistMinAge = fetchGuild.blackList.minAge;
      const blacklistTime = fetchGuild.blackList.time;

      if (Date.now() - member.user.createdTimestamp < blacklistMinAge)
        warn = true;

      const EmbedInfo = this.client
        .Embed()
        .setAuthor({
          name: `${member.user.username} entrou no servidor!`,
          iconURL: member.user.displayAvatarURL({ dynamic: true }),
        })

        .setColor("#3ba55d")
        .setDescription(member.toString())
        .addFields({
          name: "📅 " + "Conta criada" + ":",
          value: `${this.client.Formatter(
            member.user.createdTimestamp
          )} - ${this.client.Formatter(member.user.createdTimestamp, "R")}`,
        })
        .setTimestamp()
        .setFooter({
          text: `${member.user.tag} - ${member.user.id}`,
        });

      if (warn) {
        member.timeout(blacklistTime);
        EmbedInfo.setTitle("Conta temporariamente na blacklist")
          .setDescription(
            member.toString() + "\nUtilize `/unmute` para remover as restrições"
          )
          .setFields({
            name: "Motivo" + ":",
            value:
              "Conta mais nova que" +
              ":" +
              `\`${this.client.PrettyMs(blacklistMinAge, {
                verbose: true,
              })}\``,
          })
          .setThumbnail(
            "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/282/warning_26a0-fe0f.png"
          )
          .setColor("#ffcc4d");
      }
      logsChannel.send({ embeds: [EmbedInfo] }).catch(() => undefined);
    }

    const autoRoles = fetchGuild.autoRole.roles;
    if (autoRoles.length === 0) autoRoleSystem = false;

    if (autoRoleSystem) {
      autoRoles
        .slice()
        .reverse()
        .forEach((role) => {
          guild.roles.cache.find((r) => r.id === role);
          member.roles.add(role).catch(() => undefined);
        });
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
