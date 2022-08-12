const { Command } = require("sheweny");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

module.exports = class SetupBotCommand extends Command {
  constructor(client) {
    super(client, {
      name: "configurar",
      description: "📝 Configure os comandos do bot",
      examples: "É o que é...",
      category: "Configuração",
      userPermissions: ["ManageGuild"],
      options: [
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "menu",
          description: "🔧 Veja o menu de configuração do Bot",
        },
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "canais",
          description: "📙 Configure os canais do servidor",
          options: [
            {
              type: ApplicationCommandOptionType.String,
              name: "uso",
              description: "📝 Digite um canal para configurar",
              required: true,
              choices: [
                {
                  name: "🚀 Canal de logs - rastreie interações específicas de usuários",
                  value: "logs",
                },
                {
                  name: "🎈 Canal para reivindicar cargos - permite que os usuários escolham um cargo a partir de uma reação",
                  value: "reivindicarcargo",
                },
                {
                  name: "🧾 Canal de contagem de usuários - permite que os usuários vejam a contagem de membros do servidor",
                  value: "membercount",
                },
              ],
            },
            {
              type: ApplicationCommandOptionType.Channel,
              name: "canal",
              description: "🚀 Escolha um canal",
              required: true,
              channelTypes: [ChannelType.GuildText, ChannelType.GuildCategory],
            },
          ],
        },
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "blacklist",
          description: "👮 Gerencie restrições para usuários novos",
          options: [
            {
              type: ApplicationCommandOptionType.String,
              name: "escolha",
              description: "📝 Tipo do timer para configurar",
              required: true,
              choices: [
                {
                  name: "⌚ Tempo da Blacklist - altere por quanto tempo o bot bloqueará os novos usuários",
                  value: "blacklist_time",
                },
                {
                  name: "🎣 Idade mínima da conta - altere a idade mínima que um novo usuário deve ter para entrar no servidor",
                  value: "blacklist_minimum_age",
                },
              ],
            },
            {
              type: ApplicationCommandOptionType.String,
              name: "formato",
              description: "🕒 Qual formato você deseja usar?",
              required: true,
              choices: [
                {
                  name: "🕒 Horas",
                  value: "horas",
                },
                {
                  name: "🕒 Minutos",
                  value: "minutos",
                },
              ],
            },
            {
              type: ApplicationCommandOptionType.Integer,
              name: "tempo",
              description: "⏱️ Defina o tempo",
              required: true,
              minValue: 1,
              maxValue: 670,
            },
          ],
        },
        {
          type: ApplicationCommandOptionType.SubcommandGroup,
          name: "reivindicarcargo",
          description: "🎈 Configure o sistema de reivindicação de cargos",
          options: [
            {
              type: ApplicationCommandOptionType.Subcommand,
              name: "adicionar",
              description: "🎈 Adicione um cargo ao sistema reivindicação de cargos",
              options: [
                {
                  type: ApplicationCommandOptionType.Role,
                  name: "cargo",
                  description: "🧮 Escolha um cargo que você deseja adicionar",
                  required: true,
                },
                {
                  type: ApplicationCommandOptionType.String,
                  name: "emoji",
                  description:
                    "😄 Escolha um emoji que você quer para esse cargo",
                  required: true,
                },
                {
                  type: ApplicationCommandOptionType.String,
                  name: "descricao",
                  description:
                    "✍️ Escolha uma descrição para esse cargo (opcional)",
                  required: false,
                },
              ],
            },
            {
              type: ApplicationCommandOptionType.Subcommand,
              name: "remover",
              description: "🎈 Exclua um cargo do sistema reivindicação de cargos",
              options: [
                {
                  type: ApplicationCommandOptionType.Role,
                  name: "cargo",
                  description: "🧮 Escolha um cargo que você deseja excluir",
                  required: false,
                },
                {
                  type: ApplicationCommandOptionType.String,
                  name: "emoji",
                  description: "😄 Escolha um emoji que você quer excluir",
                  required: false,
                },
              ],
            },
          ],
        },
        {
          type: ApplicationCommandOptionType.SubcommandGroup,
          name: "autocargo",
          description:
            "🎩 Atribua cargos automaticamente a um novo usuário quando ele entrar no servidor",
          options: [
            {
              type: ApplicationCommandOptionType.Subcommand,
              name: "adicionar",
              description:
                "🎩 Atribua um novo cargo quando um novo usuário entrar no servidor",
              options: [
                {
                  type: ApplicationCommandOptionType.Role,
                  name: "cargo",
                  description: "🧮 Cargo a ser atribuido ao novo usuário",
                  required: true,
                },
              ],
            },
            {
              type: ApplicationCommandOptionType.Subcommand,
              name: "remover",
              description: "🎩 Remove um cargo da lista dos auto-cargos",
              options: [
                {
                  type: ApplicationCommandOptionType.Role,
                  name: "cargo",
                  description: "🧮 Cargo a ser removido da lista",
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    });
  }

  async execute(interaction) {
    const { guild, options } = interaction;

    const fetchGuild = await this.client.getGuild(guild);

    if (options._subcommand === "menu") {
      if (!(await this.client.Defer(interaction))) return;

      return interaction.editReply({
        content: "`🐲 Clique no botão abaixo`",
        components: [
          this.client.ButtonRow([
            {
              customId: "setup-menu",
              label: "Configurar",
              style: "SECONDARY",
              emoji: "🔧",
            },
          ]),
        ],
      });
    }

    switch (options._group) {
      case "reivindicarcargo":
        const rlcType = fetchGuild.roleClaim.type;
        let msgId = fetchGuild.roleClaim.message;
        let channelId = fetchGuild.roleClaim.channel;
        let tipMsgId = fetchGuild.roleClaim.tipMessage;
        let msg, tipMsg, foundChannel;

        if (!channelId || !msgId) {
          return interaction.reply({
            ephemeral: true,
            content:
              "`🚫` Você precisa configurar o sistema reivindicação de cargos primeiro.\n\n> Utilize `/configurar canais`",
          });
        }

        try {
          foundChannel = guild.channels.cache.get(channelId);
          msg = await foundChannel.messages.fetch(msgId);
        } catch (e) {
          return interaction.reply({
            ephemeral: true,
            content:
              "`⛔` Ocorreu um erro: Não foi possível encontrar a mensagem de solicitação de cargo.\n\n> Tente configurar o sistema reivindicação de cargos novamente.\n\n> Se o erro persistir, fale com o administrador do bot",
          });
        }

        try {
          tipMsg = await foundChannel.messages.fetch(tipMsgId);
        } catch (e) {}

        let roleRC = options.getRole("cargo"),
          roleAlreadyExist;
        if (
          roleRC &&
          this.client.HighestRole(guild, this.client.user.id) <
            roleRC.rawPosition &&
          options._subcommand != "remover"
        ) {
          return interaction.reply({
            ephemeral: true,
            content: `\`🚫\` Um dos meus cargos precisa estar acima de ${roleRC.toString()} para realizar essa ação.\n\n> Você pode fazer isso em \`configurações do servidor -> cargos\``,
          });
        }

        if (roleRC && roleRC.id === guild.id) {
          return interaction.reply({
            ephemeral: true,
            content: `\`🚫\` Você não pode atribuir <@&${guild.id}>`,
          });
        }

        let emoji = options.getString("emoji");

        let emojiName,
          isEmojiCustom = false,
          customEmoji,
          emojiAlreadyExist;

        if (emoji && emoji.startsWith("<") && emoji.endsWith(">")) {
          if (!(await this.client.IsValidEmoji(emoji)))
            return interaction.reply({
              ephemeral: true,
              content: `\`🚫\` Não consigo encontrar \`:${
                emoji.split(":")[1]
              }:\` emoji.\n\n> Eu preciso estar no mesmo servidor que o emoji selecionado`,
            });
          emojiName = emoji;
          isEmojiCustom = true;
        }

        if (emoji && !isEmojiCustom && !this.client.HasEmoji(emoji)) {
          return interaction.reply({
            ephemeral: true,
            content: `\`🚫\` \` ${emoji} \` não é suportado.\n\n> Por favor, escolha um [emoji](https://emojipedia.org)`,
          });
        }
        if (emoji && !isEmojiCustom)
          emojiName = this.client.GetEmojiNameFromUni(emoji);

        let rolesEmbed, fieldValue;
        if (rlcType === "reaction") {
          rolesEmbed = this.client
            .Embed(false)
            .setTitle(msg.embeds[0].title)
            .setDescription(msg.embeds[0].description)
            .setFields(msg.embeds[0].fields)
            .setFooter({ text: msg.embeds[0].footer.text })
            .setColor(msg.embeds[0].color);
        }

        switch (options._subcommand) {
          case "adicionar":
            if (!(await this.client.Defer(interaction))) return;
            const description = options.getString("descricao");

            if (msg.reactions.cache.size >= 20) {
              return interaction.editReply(
                `\`⛔\` A mensagem de reivindicação de cargo atingiu o número máximo de reações.\n\n> São fornecidos até 20 cargos.`
              );
            }

            const fieldsArray = fetchGuild.roleClaim.fields;

            emojiAlreadyExist = fieldsArray.filter(
              (f) => emojiName === f.emojiName
            );

            roleAlreadyExist = fieldsArray.filter(
              (f) => roleRC.id === f.roleId
            );

            if (emojiName && emojiAlreadyExist.length > 0) {
              return interaction.editReply(
                `\`🚫\` \`${
                  isEmojiCustom ? emojiName : `\`${emoji}\``
                }\` já está sendo usado para <@&${
                  emojiAlreadyExist[0].roleId
                }>.\n\n> Exclua-o primeiro com \`/configurar reivindicarcargo remover\``
              );
            }

            if (roleRC && roleAlreadyExist.length > 0) {
              return interaction.editReply(
                `\`🚫\` You have already added ${roleRC.toString()} with ${
                  roleAlreadyExist[0].emojiName.startsWith("<")
                    ? roleAlreadyExist[0].emojiName
                    : `\`${this.client.GetEmojiFromName(
                        roleAlreadyExist[0].emojiName
                      )}\`.\n\n> Exclua-o primeiro com \`/configurar reivindicarcargo remover\``
                }`
              );
            }

            const field = {
              emojiName: emojiName,
              roleId: roleRC.id,
            };
            fieldsArray.push(field);

            await this.client.updateGuild(guild, {
              "roleClaim.fields": fieldsArray,
            });

            rolesEmbed.addFields([
              {
                name: `${description ? description : roleRC.name}`,
                value: emoji,
                inline: true,
              },
            ]);
            msg.react(emoji);

            await msg.edit({
              embeds: [rolesEmbed],
            });

            return interaction.editReply(
              `\`✅\` Adicionado ${roleRC.toString()} com ${
                isEmojiCustom ? emojiName : `\`${emoji}\``
              }`
            );

          case "remover":
            if (!(await this.client.Defer(interaction))) return;
            let roleId, emojiUNI;

            if (!roleRC && !emoji) {
              msg.delete().catch(() => undefined);
              tipMsg.delete().catch(() => undefined);

              await this.client.updateGuild(guild, {
                "roleClaim.fields": [],
                "roleClaim.channel": null,
                "roleClaim.message": null,
                "roleClaim.tipMessage": null,
              });

              return interaction.editReply(
                `\`❎\` Sistema de reivindicação de cargo removido com sucesso.`
              );
            }

            for (let i in msg.embeds[0].fields) {
              fieldValue = msg.embeds[0].fields[i].value;

              if (!emoji && roleRC) {
                isEmojiCustom = fieldValue.startsWith("<") ? true : false;
              }

              if (emoji) {
                fieldValue = isEmojiCustom
                  ? fieldValue
                  : this.client.GetEmojiNameFromUni(fieldValue);
              }

              emojiAlreadyExist = emoji
                ? fetchGuild.roleClaim.fields.filter(
                    (f) => emojiName === f.emojiName
                  )
                : null;

              roleAlreadyExist = roleRC
                ? fetchGuild.roleClaim.fields.filter(
                    (f) => roleRC.id === f.roleId
                  )
                : null;

              if (
                (emoji && fieldValue === emojiName) ||
                (roleRC && roleAlreadyExist.length > 0)
              ) {
                let roldDB = emoji ? emojiAlreadyExist : null;

                if (roleRC)
                  emojiName = isEmojiCustom
                    ? fieldValue
                    : this.client.GetEmojiNameFromUni(fieldValue);

                roleId = roleRC ? roleRC.id : roldDB[0].roleId;

                if (isEmojiCustom) {
                  customEmoji = fieldValue.split(":")[2].slice(0, -1);
                } else {
                  emojiUNI = this.client.GetEmojiFromName(fieldValue);
                }

                rolesEmbed.data.fields.splice(i, 1);
                const filteredField = fetchGuild.roleClaim.fields
                  .map((u) => u.roleId)
                  .indexOf(
                    roleAlreadyExist
                      ? roleAlreadyExist[0].roleId
                      : roldDB[0].roleId
                  );
                fetchGuild.roleClaim.fields.splice(filteredField, 1);
                await this.client.updateGuild(guild, {
                  "roleClaim.fields": fetchGuild.roleClaim.fields,
                });

                await msg.reactions
                  .resolve(!isEmojiCustom ? emojiUNI : customEmoji)
                  .remove();

                await msg.edit({
                  embeds: [rolesEmbed],
                });

                return interaction.editReply(
                  `\`❎\` Removido <@&${roleId}> com ${
                    isEmojiCustom ? fieldValue : `\`${emojiUNI}\``
                  }`
                );
              }
            }
            if (roleRC)
              return interaction.editReply(
                `\`🚫\` ${roleRC.toString()} não é utilizado.`
              );

            if (emoji)
              return interaction.editReply(
                `\`🚫\` ${
                  emoji.startsWith("<") ? emoji : `\`${emoji}\``
                } não é utilizado.`
              );
            break;
        }
        break;

      case "autocargo":
        if (!(await this.client.Defer(interaction))) return;
        const roleAR = options.getRole("cargo");
        const autoroleArray = fetchGuild.autoRole.roles;
        const moreThanOneRole = autoroleArray.length > 1;

        switch (options._subcommand) {
          case "adicionar":
            if (roleAR.id === guild.id) {
              return interaction.editReply(
                `\`🚫\` Você não pode atribuir <@&${guild.id}>`
              );
            }

            if (
              this.client.HighestRole(guild, this.client.user.id) <
              roleAR.rawPosition
            ) {
              return interaction.editReply(
                `\`🚫\` Uma das minhas funções precisa estar acima de ${roleAR.toString()} para realizar essa ação.\n\n> Você pode fazer isso em \`Configurações do Servidor -> Cargos\``
              );
            }

            if (autoroleArray.length === 5) {
              return interaction.editReply(
                `\`🚫\` Você não pode ter mais de 5 cargos atribuídas.`
              );
            }

            if (autoroleArray.filter((r) => r == roleAR.id).length > 0) {
              return interaction.editReply(
                `\`🚫\` ${roleAR.toString()} já esta na lista.`
              );
            }

            autoroleArray.push(roleAR.id);
            await this.client.updateGuild(guild, {
              "autoRole.roles": autoroleArray,
            });

            return interaction.editReply({
              content: `\`✅\` Autocargo adicionado ${roleAR.toString()}.`,
              components: [
                this.client.ButtonRow([
                  {
                    customId: "list-autorole",
                    label: "Listar",
                    style: "PRIMARY",
                    emoji: "📋",
                  },
                  {
                    customId: "reset-autorole",
                    label: "Resetar",
                    style: "SECONDARY",
                    emoji: "🗑",
                  },
                ]),
              ],
            });

          case "remover":
            if (!autoroleArray || autoroleArray.length === 0)
              return interaction.editReply(
                `\`🚫\` Nenhum cargo setado.\n\n> Selecione um com \`/configurar autocargo adicionar\``
              );

            if (autoroleArray.filter((r) => r == roleAR.id).length === 0)
              return interaction.editReply(
                `\`🚫\` ${roleAR.toString()} não está na lista.${
                  moreThanOneRole
                    ? `\n\n> Cargo(s): ${autoroleArray
                        .map((r) => `<@&${r}>`)
                        .join(", ")}`
                    : ""
                }`
              );

            const filteredRole = autoroleArray.indexOf(roleAR.id);
            autoroleArray.splice(filteredRole, 1);
            await this.client.updateGuild(guild, {
              "autoRole.roles": autoroleArray,
            });

            return interaction.editReply(
              `\`❎\` Autocargo removido ${roleAR.toString()}.${
                moreThanOneRole
                  ? `\n\n> Cargo(s): ${autoroleArray
                      .map((r) => `<@&${r}>`)
                      .join(", ")}`
                  : ""
              }`
            );
        }
    }

    switch (options._subcommand) {
      case "canais":
        if (!(await this.client.Defer(interaction))) return;
        const usage = options.getString("uso");
        const channel = options.getChannel("canal");
        let noParent = false;

        if (usage === "reivindicarcargo") {
          if (channel.type !== ChannelType.GuildText) {
            return interaction.editReply(
              `\`🚫\` **${channel.toString()}** não é um canal de texto.`
            );
          }

          if (fetchGuild.roleClaim.message) {
            let msgId, tipMsgId, channelId, foundChannel, msg, tipMsg;

            msgId = fetchGuild.roleClaim.message;
            channelId = fetchGuild.roleClaim.channel;
            tipMsgId = fetchGuild.roleClaim.tipMessage;

            if (channelId && msgId && tipMsgId) {
              try {
                foundChannel = guild.channels.cache.get(channelId);
                msg = await foundChannel.messages.fetch(msgId);
                tipMsg = await foundChannel.messages.fetch(tipMsgId);
                msg.delete();
                tipMsg.delete();
              } catch (e) {}
            }

            this.client.updateGuild(guild, { roleclaim_Roles: [] });
          }

          channel
            .send({
              embeds: [
                this.client
                  .Embed()
                  .setTitle("Sistema de cargos automatizados")
                  .setDescription(
                    "Receba cargos de acordo com a sua escolha\n"
                  )
                  .setFooter({
                    text: "Será utilizado em eventos especiais...",
                  }),
              ],
            })
            .then((embedMsg) => {
              try {
                this.client.updateGuild(guild, {
                  "roleClaim.message": embedMsg.id,
                  "roleClaim.channel": channel.id,
                });
              } catch (e) {
                return interaction.editReply(
                  `\`⛔\` Ocorreu um erro: ${"```"}${
                    e.message
                  }${"```"}\nPor favor, entre em contato com o administrador do bot para obter ajuda.`
                );
              }

              channel
                .send({
                  content: "> Adicione cargos com `/configurar reivindicarcargo adicionar`",
                })
                .then((tipMsg) => {
                  this.client.updateGuild(guild, {
                    "roleClaim.tipMessage": tipMsg.id,
                  });
                });
            });

          await this.client.Wait(1000);

          return interaction.editReply({
            content: `\`✅\` Sistema de Reivindicação de Cargos criado em ${channel.toString()}\n\n> Utilize o botão abaixo para editar a mensagem de reivindicação de cargo.`,
            components: [
              this.client.ButtonRow([
                {
                  customId: "edit-roleclaim",
                  label: "Editar",
                  style: "PRIMARY",
                  emoji: "✏️",
                },
                {
                  customId: "delete-roleclaim",
                  label: "Deletar",
                  style: "SECONDARY",
                  emoji: "🗑",
                },
              ]),
            ],
          });
        }
        if (usage === "membercount") {
          if (fetchGuild.memberCount.channel) {
            let channelFound = await guild.channels.cache.get(
              fetchGuild.memberCount.channel
            );
            if (channelFound) channelFound.delete().catch(() => undefined);
            await this.client.updateGuild(guild, {
              "memberCount.channel": null,
            });
          }

          let parentFound =
            channel.type === ChannelType.GuildCategory ? channel : null;
          if (!parentFound) noParent = true;
          await guild.channels
            .create({
              name: "👥 Usuários:",
              type: ChannelType.GuildVoice,
              parent: parentFound,
              permissionOverwrites: [
                {
                  id: this.client.application.id,
                  allow: ["Connect"],
                },
                {
                  id: guild.id,
                  allow: ["ViewChannel"],
                  deny: ["Connect"],
                },
              ],
            })
            .then(async (c) => {
              this.client.UpdateMemberCount(
                guild,
                c.id,
                fetchGuild.memberCount.name
              );

              await this.client.updateGuild(guild, {
                "memberCount.channel": c.id,
              });

              return interaction.editReply({
                content: `🧾 O canal de contagem de membros agora está configurado em ${
                  !noParent ? `<#${channel.id}>` : "categoria padrão"
                }.`,
                components: [
                  this.client.ButtonRow([
                    {
                      customId: "rename-membercount",
                      label: "Renomear",
                      style: "PRIMARY",
                      emoji: "✏️",
                    },
                    {
                      customId: "delete-membercount",
                      label: "Deletar",
                      style: "SECONDARY",
                      emoji: "🗑",
                    },
                  ]),
                ],
              });
            })
            .catch((e) => {
              return interaction.editReply(
                `\`⛔\` Ocorreu um erro: ${"```"}${
                  e.message
                }${"```"}\nPor favor, entre em contato com o administrador do bot para obter ajuda.`
              );
            });

          return;
        }

        if (usage === "logs") {
          if (channel.type === ChannelType.GuildCategory)
            return interaction.editReply(
              `\`🚫\` Você não pode atribuir uma categoria como um canal de logs.`
            );

          await this.client.updateGuild(guild, { "logs.channel": channel.id });
          const enabledLogs = fetchGuild.logs.enabled;

          return interaction.editReply({
            content: `\`🚀\` O canal de logs agora está configurado em ${channel.toString()}\n\nVocê pode **ativar ou desativar registros** com os **botões abaixo**.`,
            components: [
              this.client.SelectMenuRow(
                "logs-select",
                "Quais logs você deseja ver?",
                [
                  {
                    label: "Moderação",
                    description: "Comandos kick, ban, mute, warn, blacklist",
                    value: "moderation",
                    emoji: "🛡️",
                    default: enabledLogs.includes("moderation"),
                  },
                  {
                    label: "Alterações de canais",
                    description: "Comandos slowmode, lock, clear.",
                    value: "channels",
                    emoji: "📙",
                    default: enabledLogs.includes("channels"),
                  },
                  {
                    label: "Entrada & Saída",
                    description:
                      "Sempre que um membro entra ou sai do servidor.",
                    value: "joinLeave",
                    emoji: "📝",
                    default: enabledLogs.includes("joinLeave"),
                  },
                  {
                    label: "Mensagens deletadas",
                    description: "Se uma mensagem for excluída por um usuário.",
                    value: "msgDelete",
                    emoji: "🗑",
                    default: enabledLogs.includes("msgDelete"),
                  },
                  {
                    label: "Mensagens editadas",
                    description: "Se uma mensagem for editada por um usuário.",
                    value: "msgEdit",
                    emoji: "✍️",
                    default: enabledLogs.includes("msgEdit"),
                  },
                ],
                { min: 0, max: 5 }
              ),
            ],
          });
        }
        break;

      case "blacklist":
        if (!(await this.client.Defer(interaction))) return;

        const choice = options.getString("escolha");
        const format = options.getString("formato");
        const time =
          format === "minutos"
            ? options.getInteger("tempo") * 60000
            : options.getInteger("tempo") * 3600000;

        if (choice === "blacklist_minimum_age") {
          await this.client.updateGuild(guild, {
            "blackList.minAge": time,
          });
        }

        if (choice === "blacklist_time") {
          await this.client.updateGuild(guild, {
            "blackList.time": time,
          });
        }

        return interaction.editReply({
          content: `\`🔒\` ${this.client.Capitalize(
            choice.replace(/_/g, " ")
          )} agora está definido para: \`${this.client.PrettyMs(time, {
            verbose: true,
          })}\``,
        });
    }
  }
};
