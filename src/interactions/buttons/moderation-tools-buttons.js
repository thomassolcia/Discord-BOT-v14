const { Button } = require("sheweny");

module.exports = class moderationToolsButtons extends Button {
  constructor(client) {
    super(client, ["blacklist-tool", "delDcInvites-tool"]);
  }

  async execute(button) {
    if (!(await this.client.Defer(button))) return;

    const { guild } = button;
    const fetchGuild = await this.client.getGuild(guild);
    const moderationTools = fetchGuild.moderationTools.enabled;

    switch (button.customId) {
      case "blacklist-tool":
        moderationTools.push("blacklist");

        button.editReply({
          content:
            "`🛡️` O recurso da blacklist agora está ativado ✅\n\n> Você pode executar novamente o comando",
        });
        break;

      case "delDcInvites-tool":
        moderationTools.push("delDcInvites");

        button.editReply({
          content:
            "`🔗` O bloqueador de links de convite agora está ativado ✅\n\n> Você pode executar novamente o comando",
        });
        break;
    }

    await this.client.updateGuild(guild, {
      "moderationTools.enabled": moderationTools,
    });
  }
};