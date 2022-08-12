const { Command } = require("sheweny");
const { ApplicationCommandOptionType } = require("discord.js");

module.exports = class LsWarnCommand extends Command {
  constructor(client) {
    super(client, {
      name: "warns-list",
      description: "🔨 Lista todos os avisos de um usuário.",
      examples:
        "/warns-list `member:@awoone#0001` => 🔨 Lista todos os avisos do `@awoone#0001`",
      category: "Administrativos",
      userPermissions: ["ModerateMembers"],
      clientPermissions: ["ModerateMembers"],
      options: [
        {
          type: ApplicationCommandOptionType.User,
          name: "usuario",
          description: "👤 O usuário a ser listados os avisos",
          required: true,
        },
      ],
    });
  }
  async execute(interaction) {
    if (!(await this.client.Defer(interaction))) return;
    const { guild, options } = interaction;

    const member = options.getMember("usuario");
    if (!member) return interaction.editReply(`\`🚫\` Não consigo encontrar esse usuário.`);

    const fetchGuild = await this.client.getGuild(guild);
    const filteredUser = fetchGuild.logs.users.filter(
      (u) => u.id === member.id
    );
    if (filteredUser.length === 0)
      return interaction.editReply(`\`🚫\` Este usuário não tem avisos.`);

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

    return interaction.editReply({
      embeds: [
        this.client
          .Embed()
          .setAuthor({
            name: `${member.user.tag} avisos 🔨`,
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
