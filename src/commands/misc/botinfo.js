const { Command } = require("sheweny");
const botVersion = require("../../../package.json").version;

module.exports = class BotInfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: "botinfo",
      description: "🔖 Obtenha informações sobre o bot",
      examples: "/botinfo => Obtenha o tempo de atividade do bot e a contagem de servidores",
      category: "Diversos",
      userPermissions: ["SendMessages"],
      clientPermissions: ["SendMessages"],  
    });
  }
  async execute(interaction) {
    if (!(await this.client.Defer(interaction))) return;

    const ram = process.memoryUsage().heapUsed / 1024 / 1024
    const bot = interaction.client;

    await interaction.editReply({
      embeds: [
        this.client
          .Embed()
          .setAuthor({
            name: bot.user.username,
            iconURL: bot.user.displayAvatarURL({ dynamic: true }),
          })
          .setDescription(
            `Dev: [awoone](https://github.com/thomassolcia)`
          )
          .addFields(
            {
              name: "🤖 " + "Versão" + ":",
              value: `${"```"}${botVersion}${"```"}`,
              inline: true,
            },
            {
              name: "⏲️ " + "Ativo" + ":",
              value: `${"```"}${this.client.PrettyMs(bot.uptime)}${"```"}`,
              inline: true,
            },
            {
              name: "🧭 " + "Servidores" + ":",
              value: `${"```"}${bot.guilds.cache.size} ${"```"}`,
              inline: true,
            },
            { 
              name: "🎛️ " + "RAM:", 
              value: `${"```"}${Math.round(ram * 100) / 100}MB ${"```"}`, 
              inline: true 
            },
            { 
              name: "🗄️ " + "Servidores:", 
              value: `${"```"}${this.client.guilds.cache.size} ${"```"}`, 
              inline: true 
            }, 
            { 
              name: "👥 " + "Usuários:", 
              value: `${"```"}${this.client.users.cache.size} ${"```"}`, 
              inline: true 
            }
          ),
      ],
      components: [
        this.client.ButtonRow([
          {
            url: "https://github.com/thomassolcia/Discord-BOT-v14",
            label: "GitHub",
            style: "LINK",
            emoji: "<:Github:995795578510385322>",
          },
        ]),
      ],
    });
  }
};