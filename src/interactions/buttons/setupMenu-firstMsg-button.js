const { Button } = require("sheweny");

module.exports = class SetupMenuButton extends Button {
  constructor(client) {
    super(client, ["setup-menu"]);
  }
  async execute(button) {
    if (!(await this.client.Defer(button))) return;
    const { member } = button;

    if (!member.permissions.has("ManageGuild"))
      return button.editReply(
        `\`🚫\` Você não tem permissão para isso! Permissão necessária: \`ManageGuild\``
      );

    button.editReply({
      ephemeral: true,
      content: `O que você deseja de configurar ${member.toString()} ?`,
      components: [
        this.client.SelectMenuRow(
          "setup-select",
          "Qual recurso você deseja configurar?",
          [
            {
              label: "Configuração dos Canais",
              description: "NECESSÁRIO - Configure os canais utilizados pelo bot.",
              value: "channel_option",
              emoji: "📚",
            },
            {
              label: "Configuração de Cargos",
              description: "OPCIONAL - Permita que os usuários reivindiquem cargos a partir de uma mensagem",
              value: "roleclaim_option",
              emoji: "🗂️",
            },
            {
              label: "Configuração de Cargos Automatizados",
              description: "OPCIONAL - Dê cargos aos novos usuários",
              value: "autorole_option",
              emoji: "🎩",
            },
            {
              label: "Configuração de Blacklist",
              description:
                "OPCIONAL - Proteja o servidor contra bots, golpes, etc..",
              value: "blacklist_option",
              emoji: "🛡️",
            },
          ]
        ),
      ],
    });
  }
};
