const { Event } = require("sheweny");

module.exports = class guildCreateEvent extends Event {
  constructor(client) {
    super(client, "guildCreate", {
      description: "Entrou no servidor",
    });
  }

  async execute(guild) {
    await this.client.createGuild(guild);

    this.client.Wait(2000);
    try {
      this.client.channels.cache.get(guild.systemChannelId).send({
        content: `Olá 👋, sou **${this.client.user.username}**! \`🦁\`\n😄 Fico feliz em aceitar o convite para o **${guild.name}**.\nAtualmente ajudando \`${this.client.guilds.cache.size}\` servidores!\n\n> Forneço recursos para **melhorar o funcionamento do seu servidor**:\n> comandos administrativos, reivindicação de cargos... e muito mais \`🦾\`\n> *Eu até tenho a capacidade de executar uma atividade do Youtube em seu canal de voz!*\n\n\`💡\` É **fortemente sugerido que me configure** utilizando o **botão abaixo** e os comandos \`/configurar\`.`,
        components: [
          this.client.ButtonRow([
            {
              customId: "setup-menu",
              label: "Configurar",
              style: "SECONDARY",
              emoji: "🔧",
            },
            {
              url: "https://github.com/thomassolcia",
              label: "GitHub",
              style: "LINK",
              emoji: "<:Github:995795578510385322>",
            },
          ]),
        ],
      });
    } catch (_e) {}
  }
};
