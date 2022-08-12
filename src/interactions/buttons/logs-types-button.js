const { Button } = require("sheweny");

module.exports = class logsSetupButton extends Button {
  constructor(client) {
    super(client, ["setup-logs"]);
  }

  async execute(button) {
    if (!(await this.client.Defer(button))) return;

    const { guild } = button;

    const fetchGuild = await this.client.getGuild(guild);
    const logsChannel = this.client.channels.cache.get(fetchGuild.logs.channel);
    if (!logsChannel) {
      return button.editReply(
        `\`🚫\` Não consigo encontrar o canal de logs.\n\n> Por favor, utilize \`/configurar canais\` para configurá-lo.`
      );
    }
    const enabledLogs = fetchGuild.logs.enabled;

    return button.editReply({
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
};
