const { SelectMenu } = require("sheweny");

module.exports = class SetupMenu2MsgSelect extends SelectMenu {
  constructor(client) {
    super(client, ["setup-select"]);
  }

  async execute(selectMenu) {
    if (!(await this.client.Defer(selectMenu))) return;
    const { guild } = selectMenu;
    const fetchGuild = await this.client.getGuild(guild);

    switch (selectMenu.values[0]) {
      case "channel_option":
        const logsChannel = fetchGuild.logs.channel;
        const roleclaimChannel = fetchGuild.roleClaim.channel;
        const membercountChannel = guild.channels.cache.get(
          fetchGuild.memberCount.channel
        );
        const JTCChannel = guild.channels.cache.get(
          fetchGuild.joinToCreate.channel
        );

        selectMenu.editReply({
          content: `${
            logsChannel
              ? "> **`🚀` Logs** está configurado em " +
                `<#${logsChannel}>` +
                ". \n"
              : ""
          } ${
            roleclaimChannel
              ? "> **`🗂️` Reivindicação de cargos** está configurado em " +
                `<#${roleclaimChannel}>` +
                ". \n"
              : ""
          } ${
            membercountChannel
              ? "> **`🧾` Contagem de usuários** está configurado na categoria " +
                `**${
                  membercountChannel.parent
                    ? `<#${membercountChannel.parentId}>`
                    : "padrão"
                }**` +
                " \n"
              : ""
          }\nPor favor, utilize \`/configurar canais\` para configurar os canais.`,
        });

        if (
          logsChannel ||
          roleclaimChannel ||
          membercountChannel ||
          JTCChannel
        ) {
          let buttons = [];
          if (logsChannel) {
            buttons.push({
              customId: "setup-logs",
              label: "Configurar Logs",
              style: "SECONDARY",
              emoji: "🚀",
            });
          }

          if (roleclaimChannel) {
            buttons.push({
              customId: "edit-roleclaim",
              label: "Editar mensagem de reivindicação de cargo",
              style: "SECONDARY",
              emoji: "🗂️",
            });
          }

          if (membercountChannel) {
            buttons.push({
              customId: "rename-membercount",
              label: "Renomear contagem de membros",
              style: "SECONDARY",
              emoji: "🧾",
            });
          }

          return selectMenu.editReply({
            components: [this.client.ButtonRow(buttons)],
          });
        }
        break;

      case "blacklist_option":
        const blacklistTime = fetchGuild.blackList.time;
        const blacklistMinAge = fetchGuild.blackList.minAge;

        return selectMenu.editReply({
          content: `\`🛡️\` **Blacklist** é um recurso que **impede que contas recém-criadas entrem no seu servidor**. Novas contas geralmente são **bots, golpes ou anúncios** que podem ser usados ​​de forma maliciosa para **prejudicar os usuários do servidor**.\n\nA blacklist é **ativado por padrão**, você pode alterar os tempos de acordo com **suas necessidades**:\n> \`Tempo da blacklist: ${this.client.PrettyMs(
            blacklistTime,
            {
              verbose: true,
            }
          )}\` ${
            blacklistTime == 86400000 ? " (padrão)" : ""
          }\n> ↪ *altere por quanto tempo o bot bloqueará o usuário novo*
          > \`Idade obrigatória da conta: ${this.client.PrettyMs(blacklistMinAge, {
            verbose: true,
          })}\` ${
            blacklistMinAge == 3600000 ? " (padrão)" : ""
          }\n> ↪ *altere a idade mínima que um novo usuário deve ter para entrar no servidor.*
           \n\`⏱️\` Para alterar esse valores, utilize o comando \`/configurar blacklist\`.`,
        });

      case "roleclaim_option":
        const msgId = fetchGuild.roleClaim.message;
        const channelId = fetchGuild.roleClaim.channel;

        if (msgId && channelId) {
          return selectMenu.editReply({
            content: `\`🗂️\` **Reivindicação de cargo** é um recurso que permite que os **usuários do servidor escolham um cargo específico a partir de uma reação** em uma mensagem.\nEscolha os **cargos com cuidado** para manter a **segurança** do servidor.\n\n> **Mensagem de reivindicação de função** está configurada em **<#${channelId}>**.\n> Para alterar esse valor, utilize o comando \`/configurar reivindicarcargo adicionar|remover\`.\n\nVocê pode **editar o sistema de reivindicação de cargo** com os **botões abaixo**.`,
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

        return selectMenu.editReply({
          content: `\`🗂️\` **Reivindicação de função** é um recurso que permite que os **usuários do servidor escolham uma função específica adicionando uma reação** a uma mensagem.\nEscolha os **cargos com cuidado** para manter a **segurança** do servidor.\n\n> Você também pode usar \`/configurar canais\` para configurar sua reivindicação de cargo em um canal diferente de ${selectMenu.channel.toString()}.`,
          components: [
            this.client.ButtonRow([
              {
                customId: "create-roleclaim",
                label: `Criado em ${selectMenu.channel.name}`,
                style: "SUCCESS",
                emoji: "🗂️",
              },
            ]),
          ],
        });

      case "autorole_option":
        const autoroleArray = fetchGuild.autoRole.roles;

        if (autoroleArray.length === 0) {
          return selectMenu.editReply({
            content: `\`🎩\` **Auto Role** é um recurso que **automaticamente** concede uma ou mais **funções a um recém-chegado** em seu servidor.\nEscolha os **cargos com cuidado** para manter a **segurança** do seu servidor.\n\n> Você pode utilizar \`/configurar autocargo adicionar\` para configurar este recurso.`,
          });
        }

        return selectMenu.editReply({
          content: `\`🎩\` **Auto Role** é um recurso que **automaticamente** concede uma ou mais **funções a um recém-chegado** em seu servidor.\nEscolha os **cargos com cuidado** para manter a **segurança** do seu servidor.\n\n> Você pode utilizar, \`/configurar autocargo adicionar|remover\` para editar este recurso.\n\n\`🧮\` **Cargos** que serão **dados aos novos usuários**: ${autoroleArray
            .map((r) => `<@&${r}>`)
            .join(", ")}`,
          components: [
            this.client.ButtonRow([
              {
                customId: "reset-autorole",
                label: "Resetar",
                style: "SECONDARY",
                emoji: "🗑",
              },
            ]),
          ],
        });
    }
  }
};
