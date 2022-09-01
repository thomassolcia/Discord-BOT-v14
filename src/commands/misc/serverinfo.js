const { Command } = require("sheweny");

module.exports = class ServerInfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: "servidor",
      description: "⛲ Obtenha informações sobre o servidor.",
      examples: "/servidor => Obtenha informações do servidor",
      category: "Diversos",
      userPermissions: ["SendMessages"],
      clientPermissions: ["SendMessages"],       
    });
  }
  async execute(interaction) {
    if (!(await this.client.Defer(interaction))) return;

    const { guild } = interaction;
    const owner = await guild.fetchOwner();

    const filterLevels = ["Desabilitado", "Sem Cargo", "Todos"];

    const verificationLevels = ["❎", "Baixa", "Média", "Alta", "Muito Alta"];

    const boostLevel = ["❎", "Nível 1", "Nível 2", "Nível 3"];

    const serverinfo = this.client
      .Embed()
      .setAuthor({
        name: guild.name + " - " + guild.id,
        iconURL: guild.iconURL({ dynamic: true }),
      })
      .setDescription(`Dono: ${owner.user.toString()}`)
      .addFields(
        {
          name: "📅 " + "Data de criação" + ":",
          value: `${this.client.Formatter(
            guild.createdAt
          )} - ${this.client.Formatter(guild.createdAt, "R")}`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: "👤 " + "Membros" + ":",
          value: `${"```"}${guild.memberCount}${"```"}`,
          inline: true,
        },
        {
          name: "🗣️ " + "Bitrate máximo" + ":",
          value: `${"```"}${guild.maximumBitrate} kb/s${"```"}`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        {
          name: "🔒 " + "Nível do filtragem" + ":",
          value: `${"```"}${filterLevels[guild.explicitContentFilter]}${"```"}`,
          inline: true,
        },
        {
          name: "🔐 " + "Nível de Verificação" + ":",
          value: `${"```"}${
            verificationLevels[guild.verificationLevel]
          }${"```"}`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        }
      );

    if (guild.premiumTier !== 0) {
      serverinfo.addFields({
        name: "💰 " + "Server Boost" + ":",
        value: `${"```"}${boostLevel[guild.premiumTier]}${"```"}`,
        inline: true,
      });
    }

    if (guild.description != null) {
      serverinfo.setDescription(
        `Dono: ${owner.user.toString()}\n${"```"}${guild.description}${"```"}`
      );
    }

    if (guild.premiumSubscriptionCount !== 0) {
      serverinfo.addFields(
        {
          name: "🪙 " + "Boost" + ":",
          value: `${"```"}${guild.premiumSubscriptionCount}${"```"}`,
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        }
      );
    }

    interaction.editReply({
      embeds: [serverinfo],
    });
  }
};