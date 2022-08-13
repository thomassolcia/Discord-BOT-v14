const { Button } = require("sheweny");

module.exports = class warnListButton extends Button {
  constructor(client) {
    super(client, ["warns-list"]);
  }

  async execute(button) {
    if (!(await this.client.Defer(button))) return;
    const { guild, message } = button;

    const fetchGuild = await this.client.getGuild(guild);

    let res;
    if (message.embeds[0]) res = message.embeds[0].data.description;
    else res = message.content;
    let userId = res.match(/\d+/)[0];

    const filteredUser = fetchGuild.logs.users.filter((u) => u.id === userId);
    if (filteredUser.length === 0)
      return button.editReply(`\`🚫\` Esse usuário não possui avisos.`);

    const member = guild.members.cache.get(userId);

    let warnList = "";
    let i = filteredUser.length + 1;
    let s = 1;

    filteredUser
      .slice()
      .reverse()
      .forEach((warn) => {
        i--;
        s++;
        if (s > 10) return;
        warnList += `\n**${i}:** por <@${
          warn.moderator
        }> - ${this.client.Formatter(warn.date, "R")}\n`;
        warnList += `Motivo: \`${warn.reason}\`\n`;
      });

    return button.editReply({
      embeds: [
        this.client
          .Embed()
          .setAuthor({
            name: `Avisos de ${member.user.tag} 🔨`,
            iconURL: member.user.avatarURL({ dynamic: true }),
          })
          .setDescription(warnList)
          .setTimestamp()
          .setFooter({
            text: `${member.user.tag} - ${member.user.id}`,
          }),
      ],
    });
  }
};