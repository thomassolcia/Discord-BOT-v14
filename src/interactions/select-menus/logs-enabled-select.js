const { SelectMenu } = require("sheweny");

module.exports = class logsEnabledSelect extends SelectMenu {
  constructor(client) {
    super(client, ["logs-select"]);
  }

  async execute(selectMenu) {
    if (!(await this.client.Defer(selectMenu))) return;
    const { guild, values } = selectMenu;

    await this.client.updateGuild(guild, {
      "logs.enabled": values,
    });

    const spelledValues = values
      .map((value) => {
        switch (value) {
          case "msgDelete":
            return "\n`🗑️` *Exclusões de mensagens*";
          case "msgEdit":
            return "\n`✍` *Edições de mensagens*";
          case "joinLeave":
            return "\n`🚪` *Entrada e Saída*";
          case "moderation":
            return "\n`🛡️` *Moderação*";
          case "channels":
            return "\n`📙` *Canais*";
        }
      })
      .join(", ");

    return selectMenu.editReply({
      content: `**Logs habilitados:**${spelledValues}\n\n> para registrar os comandos \`Kick\`, \`Ban\`, \`Mute\`, é **necessário** utilizar os **comandos dados por awoone** (\`/kick\`, \`/ban\` & \`/mute\`)`,
    });
  }
};
