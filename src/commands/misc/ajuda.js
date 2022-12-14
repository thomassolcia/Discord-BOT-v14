const { Command } = require("sheweny");
const { ApplicationCommandOptionType } = require("discord.js");

module.exports = class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: "ajuda",
      description: "ð Obtenha a lista de comandos",
      examples: "/ajuda `comando:ping` => ð Obtenha detalhes sobre o comando `ping`",
      category: "Diversos",
      userPermissions: ["SendMessages"],
      clientPermissions: ["SendMessages"],       
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: "comando",
          description: "ð¦ Nome do comando",
          required: false,
        },
      ],
    });
  }
  async execute(interaction) {
    if (!(await this.client.Defer(interaction))) return;

    const { options, member } = interaction;
    const commandArg = options.getString("comando");

    if (commandArg) {
      let command = this.client.collections.commands
        .filter((cmd) => cmd[0].name.toLowerCase() === commandArg.toLowerCase())
        .map((cmd) => cmd[0]);

      if (command.length < 1) {
        return interaction.editReply(
          `\`ð«\` Comando \`${commandArg}\` nÃ£o encontrado.`
        );
      }

      return interaction.editReply({
        embeds: [
          this.client
            .Embed()
            .setAuthor({ name: `${command[0].category}` })
            .setDescription(
              `${command[0].description}\n\nExemplo: ${command[0].examples}`
            ),
        ],
      });
    }

    const bot = interaction.client;
    let categories = [];
    let commandCount = 0;

    this.client.collections.commands.forEach((element) => {
      if (
        element[0].adminsOnly === false &&
        element[0].category !== "Setup" &&
        !categories.includes(element[0].category)
      ) {
        categories.push(element[0].category);
      }
    });

    this.client.collections.commands
      .filter((cmd) => !cmd[0].adminsOnly)
      .map((_cmd) => commandCount++);

    const embedInfo = this.client
      .Embed()
      .setAuthor({
        name: `OlÃ¡! Sou o ${bot.user.username}`,
        iconURL: bot.user.displayAvatarURL({ dynamic: true }),
      })

      .setFooter({
        text: `/ajuda comando: para obter informaÃ§Ãµes sobre um comando especÃ­fico.`,
      });

    for (const category of categories) {
      embedInfo.addFields({
        name: `${category}`,
        value: `${this.client.collections.commands
          .filter((cmd) => cmd[0].category === category)
          .map(
            (cmd) => `\`${this.client.Capitalize(cmd[0].name.toLowerCase())}\``
          )
          .join(", ")}`,
      });
    }
    embedInfo.setDescription(
      "Para configurar os recursos do bot, pressione o botÃ£o abaixo! ð¦ \n\n" +
        "Lista de " +
        commandCount +
        " comandos:"
    );

    if (member.permissions.has("ManageGuild")) {
      return interaction.editReply({
        embeds: [embedInfo],
        components: [
          this.client.ButtonRow([
            {
              customId: "setup-menu",
              label: "Configurar",
              style: "SECONDARY",
              emoji: "ð§",
            },
          ]),
        ],
      });
    }

    return interaction.editReply({
      embeds: [embedInfo],
    });
  }
};
