const { Modal } = require("sheweny");

module.exports = class roleClaimEmbedModal extends Modal {
  constructor(client) {
    super(client, ["edit-roleclaim"]);
  }

  async execute(modal) {
    const { guild } = modal;
    const fetchGuild = await this.client.getGuild(guild);

    const msgId = fetchGuild.roleClaim.message;
    const channelId = fetchGuild.roleClaim.channel;

    let foundChannel, msg;

    try {
      foundChannel = guild.channels.cache.get(channelId);
      msg = await foundChannel.messages.fetch(msgId);
    } catch (e) {
      return modal.reply({
        content:
        "`⛔` Ocorreu um erro: Não foi possível encontrar a mensagem de reivindicação de cargo.\n\n> Tente configurar novamente.\n\n> Se o erro persistir, fale com o admin",
        ephemeral: true,
      });
    }

    let rolesEmbed = this.client
      .Embed(false)
      .setTitle(msg.embeds[0].title)
      .setDescription(msg.embeds[0].description)
      .setFields(msg.embeds[0].fields)
      .setFooter({ text: msg.embeds[0].footer.text })
      .setColor(msg.embeds[0].color);

    const title = modal.fields.getTextInputValue("roleclaim-title-input");
    const description = modal.fields.getTextInputValue(
      "roleclaim-description-input"
    );
    const footer = modal.fields.getTextInputValue("roleclaim-footer-input");
    const color = modal.fields.getTextInputValue("roleclaim-color-input");

    if (title) rolesEmbed.setTitle(title);
    if (description) rolesEmbed.setDescription(description);
    if (footer) rolesEmbed.setFooter({ text: footer });
    if (color) {
      try {
        rolesEmbed.setColor(color);
      } catch (e) {
        return modal.reply({
          content: `\`🚫\` Cor inválida.\n\n> Por favor, utilize um código hexadecimal.\n\n> Por exemplo: \`#ff0000\``,
          ephemeral: true,
        });
      }
    }

    if (!title && !description && !footer && !color)
      return modal.reply({
        content: "`🚫` Nenhuma alteração realizada.",
        ephemeral: true,
      });

    await msg.edit({
      embeds: [rolesEmbed],
    });

    await modal.reply({
      content: "`✅` Mensagem embed da reivindicação de cargo foi atualizada.",
      ephemeral: true,
    });
  }
};
