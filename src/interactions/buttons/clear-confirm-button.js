const { Button } = require("sheweny");

module.exports = class ClearConfirmButton extends Button {
  constructor(client) {
    super(client, ["confirm-clear"]);
  }
  async execute(button) {
    if (!(await this.client.Defer(button))) return;
    const { guild, message, channel } = button;

    let replied = false;
    const number = message.content.match(/\d+/)[0];
    channel.bulkDelete(number).catch(() => {
      replied = true;
      return button.editReply(
        `\`🚫\` Você não pode limpar mensagens com mais de 14 dias.`
      );
    });
    await this.client.Wait(2000);
    if (replied) return;

    const fetchGuild = await this.client.getGuild(guild);
    const logsChannel = this.client.channels.cache.get(fetchGuild.logs.channel);
    const enabledLogs = fetchGuild.logs.enabled;

    button.editReply({
      content: "⛑️ " + `\`${number}\`` + " mensagens foram apagadas",
    });

    if (!logsChannel || !enabledLogs.includes("canais")) return;
    logsChannel
      .send({
        embeds: [
          this.client
            .Embed()
            .setAuthor({
              name: `by ${button.user.tag}`,
              iconURL: button.user.displayAvatarURL({
                dynamic: true,
              }),
            })
            .setDescription(
              `\`${number}\`` +
                " mensagens foram apagadas em " +
                channel.toString()
            )
            .setTimestamp()
            .setColor("#ea596e")
            .setThumbnail(
              "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/322/rescue-workers-helmet_26d1-fe0f.png"
            ),
        ],
      })
      .catch(() => undefined);
  }
};
