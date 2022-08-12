const { Button } = require("sheweny");

module.exports = class AutoRoleSetupButtons extends Button {
  constructor(client) {
    super(client, ["list-autorole", "reset-autorole"]);
  }

  async execute(button) {
    if (!(await this.client.Defer(button))) return;
    const { guild, member } = button;
    const fetchGuild = await this.client.getGuild(guild);

    switch (button.customId) {
      case "reset-autorole":
        if (!member.permissions.has("ManageGuild"))
          return button.editReply(
            `\`🚫\` Você não possui permissão para isso!`
          );

        if (fetchGuild.autoRole.roles.length === 0)
          return button.editReply(`\`🚫\` O sistema autocargo não está definido.`);

        await this.client.updateGuild(guild, {
          "autoRole.roles": [],
        });

        return button.editReply(`\`❎\` O sistema autocargo foi definido`);

      case "list-autorole":
        const autoroleArray = fetchGuild.autoRole.roles;

        if (autoroleArray.length === 0)
          return button.editReply(
            `\`🚫\` Nenhum autocargo escolhido.\n\n> Escolha um com \`/configurar autocargo adicionar\``
          );

        return button.editReply({
          content: `\`✅\` Cargos que serão atribuídas aos novos usuários: ${autoroleArray
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
