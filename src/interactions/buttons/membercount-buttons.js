const { Button } = require("sheweny");

module.exports = class memberCountButtons extends Button {
  constructor(client) {
    super(client, ["delete-membercount", "rename-membercount"]);
  }

  async execute(button) {
    const { guild } = button;

    const fetchGuild = await this.client.getGuild(guild);

    const memberCountChannel = guild.channels.cache.get(
      fetchGuild.memberCount.channel
    );

    if (!memberCountChannel) {
      this.client.updateGuild(guild, {
        "memberCount.channel": null,
      });

      return button.reply({
        content: "`🚫` Canal de contagem de membros não foi encontrado",
        ephemeral: true,
      });
    }

    switch (button.customId) {
      case "delete-membercount":
        if (!(await this.client.Defer(button))) return;

        await memberCountChannel.delete().catch((e) => {
          return button.editReply({
            content: `\`⛔\` Ocorreu um erro: ${"```"}${
              e.message
            }${"```"}\nPor favor, entre em contato com o administrador do bot para obter ajuda.`,
          });
        });

        await this.client.updateGuild(guild, {
          "memberCount.channel": null,
          "memberCount.name": "👥 Usuários",
        });

        return button.editReply({
          content: "`❎` Canal de contagem de membros deletado",
        });

      case "rename-membercount":
        await button.showModal(
          this.client.ModalRow(
            "channel-membercount",
            "Alterar canal de contagem de membros",
            [
              {
                customId: "membercount-name-input",
                label: "Nome",
                style: "Short",
                placeholder: `${this.client.Truncate(
                  memberCountChannel.name.split(":")[0]
                )}`,
                required: true,
              },
            ]
          )
        );

        break;
    }
  }
};
