const { Modal } = require("sheweny");

module.exports = class memberCountRenameModal extends Modal {
  constructor(client) {
    super(client, ["channel-membercount"]);
  }

  async execute(modal) {
    const { guild } = modal;
    const fetchGuild = await this.client.getGuild(guild);

    const name = modal.fields.getTextInputValue("membercount-name-input");
    if (!name) {
      return modal.reply({
        content: "`🚫` Nenhuma alteração feita.",
        ephemeral: true,
      });
    }

    await this.client.updateGuild(guild, {
      "memberCount.name": name,
    });

    const memberCountChannel = guild.channels.cache.get(
      fetchGuild.memberCount.channel
    );

    if (!memberCountChannel) {
      return modal.reply({
        content: "`🚫` Não foi possível encontrar o canal de contagem de membros.",
        ephemeral: true,
      });
    }

    this.client.UpdateMemberCount(guild, fetchGuild.memberCount.channel, name);

    await modal.reply({
      content: "``✅`` Canal de contagem de membros atualizado.",
      ephemeral: true,
    });
  }
};
