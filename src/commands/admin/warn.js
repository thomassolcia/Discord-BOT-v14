const { Command } = require("sheweny");
const { ApplicationCommandOptionType } = require("discord.js");

module.exports = class WarnCommand extends Command {
  constructor(client) {
    super(client, {
      name: "warn",
      description: "🔨 Avisa um usuário.",
      examples:
      "/warn adicionar `usuario:@awoone#0001` `motivo:algum motivo` => 🔨 Avisa o `@awoone#0001` por `algum motivo`",
      category: "Administrativos",
      userPermissions: ["ModerateMembers"],
      clientPermissions: ["ModerateMembers"],
      options: [
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "adicionar",
          description: "🔨 Avisa um usuário",
          options: [
            {
              type: ApplicationCommandOptionType.User,
              name: "usuario",
              description: "👤 Usuário a ser avisado",
              required: true,
            },
            {
              type: ApplicationCommandOptionType.String,
              name: "motivo",
              description: "❔ Motivo do aviso",
              required: true,
            },
          ],
        },
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "remover",
          description: "🔨 Remove o aviso de um usuário",
          options: [
            {
              type: ApplicationCommandOptionType.User,
              name: "usuario",
              description: "👤 Usuário para remover o aviso",
              required: true,
            },
            {
              type: ApplicationCommandOptionType.Number,
              name: "numero",
              description:
                "🔢 O número do aviso a ser removido (see /warn lista)",
              required: true,
            },
            {
              type: ApplicationCommandOptionType.String,
              name: "motivo",
              description: "❔ Reason for the warn removal",
            },
          ],
        },
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "lista",
          description: "🔨 Lista todos os avisos de um usuário",
          options: [
            {
              type: ApplicationCommandOptionType.User,
              name: "usuario",
              description: "👤 Usuário para listar os avisos",
              required: true,
            },
          ],
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
    const logsChannel = this.client.channels.cache.get(fetchGuild.logs.channel);
    const enabledLogs = fetchGuild.logs.enabled;

    let filteredUser, reason;
    switch (options._subcommand) {
      case "adicionar":
        reason = options.getString("motivo");
        const userArray = fetchGuild.logs.users;
        const cases = userArray.users.map((u) => u.case);
        const highestCase = Math.max(...cases);
        let d = new Date();
        const user = {
          case: cases.length === 0 ? 0 : highestCase + 1,
          id: member.id,
          name: member.displayName,
          moderator: interaction.user.id,
          reason: reason,
          date: d.getTime(),
        };

        userArray.push(user);
        await this.client.updateGuild(guild, { "logs.users": userArray });

        interaction.editReply({
          content: `\`🔨\` ${member.toString()} foi avisado.`,
          components: [
            this.client.ButtonRow([
              {
                customId: "warns-list",
                label: "Avisos",
                style: "SECONDARY",
                emoji: "🔨",
              },
            ]),
          ],
        });

        if (!logsChannel || !enabledLogs.includes("moderation")) return;
        logsChannel
          .send({
            embeds: [
              this.client
                .Embed()
                .setAuthor({
                  name: `por ${interaction.user.tag}`,
                  iconURL: interaction.user.avatarURL({ dynamic: true }),
                })
                .setDescription(`${member.toString()} foi avisado.`)
                .setFields({
                  name: `Motivo` + ":",
                  value: `${reason || "Nenhum motivo foi dado"}`,
                  inline: true,
                })
                .setThumbnail(member.displayAvatarURL({ dynamic: true }))
                .setTimestamp()
                .setFooter({
                  text: `${member.user.tag} - ${member.user.id}`,
                }),
            ],
            components: [
              this.client.ButtonRow([
                {
                  customId: "warns-list",
                  label: "Avisos",
                  style: "SECONDARY",
                  emoji: "🔨",
                },
              ]),
            ],
          })
          .catch(() => undefined);
        break;

      case "remover":
        const number = options.getNumber("numero");
        reason = options.getString("motivo");

        filteredUser = fetchGuild.logs.users.filter((u) => u.id === member.id);
        if (filteredUser.length === 0)
          return interaction.editReply(`\`🚫\` Esse usuário não possui avisos.`);

        let index;
        try {
          index = filteredUser[number - 1].case;
        } catch (e) {
          return interaction.editReply(
            `\`🚫\` O aviso **#${number}** do ${member.toString()} não existe.`
          );
        }

        const filteredCase = fetchGuild.logs.users
          .map((u) => u.case)
          .indexOf(index);

        const oldReason = fetchGuild.logs.users[filteredCase].reason;

        fetchGuild.logs.users.splice(filteredCase, 1);
        await this.client.updateGuild(guild, {
          "logs.users": fetchGuild.logs.users,
        });

        interaction.editReply({
          content: `\`❎\` O aviso **#${number}** de ${member.toString()} foi removido.`,
          components: [
            this.client.ButtonRow([
              {
                customId: "warns-list",
                label: "Avisos",
                style: "SECONDARY",
                emoji: "🔨",
              },
            ]),
          ],
        });

        if (!logsChannel || !enabledLogs.includes("moderation")) return;
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
                  "O aivso do " +
                    member.toString() +
                    " foi removido.\n" +
                    `➡️\`${oldReason}\``
                )
                .addFields({
                  name: "Motivo",
                  value: `${reason || "Nenhum motivo foi dado"}`,
                })
                .setThumbnail(member.displayAvatarURL({ dynamic: true }))
                .setTimestamp()
                .setFooter({
                  text: member.user.tag + " - " + member.user.id,
                }),
            ],
            components: [
              this.client.ButtonRow([
                {
                  customId: "warns-list",
                  label: "Avisos",
                  style: "SECONDARY",
                  emoji: "🔨",
                },
              ]),
            ],
          })
          .catch(() => undefined);
        break;

      case "lista":
        filteredUser = fetchGuild.logs.users.filter((u) => u.id === member.id);
        if (filteredUser.length === 0)
          return interaction.editReply(`\`🚫\` Esse usuário não possui avisos.`);

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
                name: `Avisos do ${member.user.tag} 🔨`,
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
  }
};