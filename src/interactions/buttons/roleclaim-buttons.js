const { Button } = require("sheweny");

module.exports = class roleClaimButtons extends Button {
  constructor(client) {
    super(client, ["create-roleclaim", "delete-roleclaim", "edit-roleclaim"]);
  }

  async execute(button) {
    const { guild, channel } = button;

    const fetchGuild = await this.client.getGuild(guild);

    const msgId = fetchGuild.roleClaim.message;
    let channelId = fetchGuild.roleClaim.channel;
    const tipMsgId = fetchGuild.roleClaim.tipMessage;
    let foundChannel, msg, tipMsg;

    switch (button.customId) {
      case "create-roleclaim":
        if (!(await this.client.Defer(button))) return;

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
        channel
          .send({
            embeds: [
              this.client
                .Embed()
                .setTitle("Sistema de cargos automatizados")
                .setDescription(
                  "Receba cargos de acordo com a sua escolha"
                )
                .setFooter({
                  text: "Será utilizado em eventos especiais",
                }),
            ],
          })
          .then((embed) => {
            try {
              this.client.updateGuild(guild, {
                "roleClaim.message": embed.id,
                "roleClaim.channel": channel.id,
              });
              channelId = channel.id;
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
              .then((tip) => {
                this.client.updateGuild(guild, {
                  "roleClaim.tipMessage": tip.id,
                });
              });

            return button.editReply({
              content: `A mensagem de reivindicação de cargo está configurada em **<#${channelId}>**.\n\n> Para alterar os cargos utilize o comando, \`/configurar reivindicarcargo adicionar/remover\`.\n> Você pode editar a mensagem de reivindicação de cargo com o botão abaixo`,
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
          });

        break;

      case "edit-roleclaim":
        if (!channelId || !msgId) {
          return button.reply({
            content:
              "`🚫` Você precisa configurar o sistema de reivindicar cargo primeiro.\n\n> Utilize `/configurar canais`",
            ephemeral: true,
          });
        }

        try {
          foundChannel = guild.channels.cache.get(channelId);
          msg = await foundChannel.messages.fetch(msgId);
        } catch (e) {
          return button.reply({
            content:
              "`⛔` Ocorreu um erro: Não foi possível encontrar a mensagem de reivindicação de cargo.\n\n> Tente configurar novamente.\n\n> Se o erro persistir, fale com o admin",
            ephemeral: true,
          });
        }

        await button.showModal(
          this.client.ModalRow("edit-roleclaim", "Edit roleclaim embed", [
            {
              customId: "roleclaim-title-input",
              label: "Título",
              style: "Short",
              placeholder: `${this.client.Truncate(msg.embeds[0].title)}`,
              required: false,
            },
            {
              customId: "roleclaim-description-input",
              label: "Descrição",
              style: "Paragraph",
              placeholder: `${this.client.Truncate(msg.embeds[0].description)}`,
              required: false,
            },
            {
              customId: "roleclaim-footer-input",
              label: "Rodapé",
              style: "Short",
              placeholder: `${this.client.Truncate(msg.embeds[0].footer.text)}`,
              required: false,
            },
            {
              customId: "roleclaim-color-input",
              label: "Cor",
              style: "Short",
              placeholder: "color must be a hex color code (#000000)",
              required: false,
            },
          ])
        );

        break;

      case "delete-roleclaim":
        if (!(await this.client.Defer(button))) return;

        if (!fetchGuild.roleClaim.message) {
          return button.editReply({
            content:
              "`🚫` Você precisa configurar o sistema de reivindicação de cargo primeiro.\n\n> Utilize `/configurar canais`",
          });
        }

        this.client.updateGuild(guild, {
          roleclaim_Roles: [],
          "roleClaim.message": null,
          "roleClaim.channel": null,
          "roleClaim.tipMessage": null,
        });

        try {
          foundChannel = guild.channels.cache.get(channelId);
          msg = await foundChannel.messages.fetch(msgId);
          tipMsg = await foundChannel.messages.fetch(tipMsgId);
          msg.delete();
          tipMsg.delete();
        } catch (e) {}

        return button.editReply({
          content: "`❎` Sistema de reivindicação de cargo excluído!",
        });
    }
  }
};
