const { SelectMenu } = require("sheweny");

module.exports = class moderationToolsSelect extends SelectMenu {
  constructor(client) {
    super(client, ["moderation-tools-select"]);
  }

  async execute(selectMenu) {
    if (!(await this.client.Defer(selectMenu))) return;
    const { guild, values } = selectMenu;

    await this.client.updateGuild(guild, {
      "moderationTools.enabled": values,
    });

    const spelledValues = values
      .map((value) => {
        switch (value) {
          case "blacklist":
            return "\n`🛡️` Blacklist";
          case "delDcInvites":
            return "\n`🔗` Bloqueador de convites";
        }
      })
      .join(", ");

    return selectMenu.editReply({
      content: `**Ferramentas de moderação ativadas:**${
        !spelledValues ? " ❎" : spelledValues
      }`,
    });
  }
};