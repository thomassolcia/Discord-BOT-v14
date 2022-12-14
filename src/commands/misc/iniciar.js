const { Command } = require("sheweny");
const { DiscordTogether } = require("discord-together");
const { ApplicationCommandOptionType } = require("discord.js");

module.exports = class PlayTogetherCommand extends Command {
  constructor(client) {
    super(client, {
      name: "iniciar",
      examples:
        "/iniciar `atividade:📽️ Youtube` => Assista o Youtube em grupo.",
      description: "🎮 Reproduza atividades ocultas do Discord em um canal de voz",
      category: "Diversos",
      userPermissions: ["SendMessages"],
      clientPermissions: ["SendMessages"],       
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: "atividade",
          description: "🎮 Atividade para reproduzir",
          required: true,
          choices: [
            {
              name: "📼 Youtube",
              value: "youtube",
            },
            {
              name: "🎨 Sketchheads",
              value: "sketchheads",
            },
            {
              name: "🎣 Fishington",
              value: "fishing",
            },
            {
              name: "♟️ Chess",
              value: "chess",
            },
            {
              name: "🃏 Poker",
              value: "poker",
            },
            {
              name: "👾 Betrayal",
              value: "betrayal",
            },
            {
              name: "📑 Letter Tile",
              value: "lettertile",
            },
            {
              name: "📝 Words Snack",
              value: "wordsnack",
            },
            {
              name: "📜 Spellcast",
              value: "spellcast",
            },
            {
              name: "🎱 Ocho",
              value: "ocho",
            },
          ],
        },
      ],
    });
  }
  async execute(interaction) {
    if (!(await this.client.Defer(interaction))) return;

    const { options, member } = interaction;
    if (!member.voice.channel)
      return interaction.editReply({
        content: "🔇 Você precisa estar em um canal de voz.",
      });

    this.client.discordTogether = new DiscordTogether(this.client);
    const activity = options.getString("atividade");

    const activities = {
      youtube: {
        name: "Youtube",
        iconURL:
          "https://cdn.discordapp.com/app-icons/880218394199220334/ec48acbad4c32efab4275cb9f3ca3a58.webp",
        emoji: "📽️",
        nitro: false,
        color: "#f80300",
      },
      sketchheads: {
        name: "Sketchheads",
        iconURL:
          "https://cdn.discordapp.com/app-icons/902271654783242291/0fbc3e38ea4b26c47d8001eff6b94a7b.webp",
        emoji: "🎨",
        nitro: false,
        color: "#f2e246",
      },
      chess: {
        name: "Chess",
        iconURL:
          "https://cdn.discordapp.com/app-icons/832012774040141894/3b3981ddf67c8702920fae10b5f123ed.webp",
        emoji: "♟️",
        nitro: true,
        color: "#c2e766",
      },
      poker: {
        name: "Poker",
        iconURL:
          "https://cdn.discordapp.com/app-icons/755827207812677713/e594da3ca4520c7edde5b59948e97cdc.webp",
        emoji: "🃏",
        nitro: true,
        color: "#a479e7",
      },
      betrayal: {
        name: "Betrayal",
        iconURL:
          "https://cdn.discordapp.com/app-icons/773336526917861400/0227b2e89ea08d666c43003fbadbc72a.webp",
        emoji: "👾",
        nitro: false,
        color: "#009ffd",
      },
      fishing: {
        name: "Fishington",
        iconURL:
          "https://cdn.discordapp.com/app-icons/814288819477020702/0cafdebe76abfd7d8d9b015c2060512e.webp",
        emoji: "🎣",
        nitro: false,
        color: "#49ceef",
      },
      lettertile: {
        name: "Letter Tile",
        iconURL:
          "https://cdn.discordapp.com/app-icons/879863686565621790/0096355142a9b00bc2676ec09b9c8dbc.webp",
        emoji: "📑",
        nitro: true,
        volor: "#ff895b",
      },
      wordsnack: {
        name: "Words Snack",
        iconURL:
          "https://cdn.discordapp.com/app-icons/879863976006127627/930f9cfe504211a130419e731babc597.webp",
        emoji: "📝",
        nitro: false,
        color: "#aa4e1e",
      },
      spellcast: {
        name: "Spellcast",
        iconURL:
          "https://cdn.discordapp.com/app-icons/852509694341283871/9a4a52c760994654a416740ae0b19fbb.webp",
        emoji: "📜",
        nitro: true,
        color: "#3f317c",
      },
      ocho: {
        name: "Ocho",
        iconURL:
          "https://cdn.discordapp.com/app-icons/832025144389533716/6fe6e3dda7657b83758693205a833aa1.webp",
        emoji: "🎱",
        nitro: true,
        color: "#77cba5",
      },
    };

    this.client.discordTogether
      .createTogetherCode(member.voice.channel.id, activity)
      .then(async (invite) => {
        return interaction.editReply({
          embeds: [
            this.client
              .Embed()
              .setAuthor({
                name: `${activities[activity].name} ${
                  activities[activity].nitro
                    ? "⚠️ Apenas para servidores impulsionados"
                    : ""
                }`,
                icon_url: activities[activity].iconURL,
              })
              .setThumbnail(activities[activity].iconURL)
              .setDescription(
                `Clique no botão abaixo para iniciar a atividade!\n\nVocê está atualmente em <#${member.voice.channel.id}>`
              )
              .setFooter({
                text: `${
                  activities[activity].nitro
                    ? "⚠️ Este servidor deve ter pelo menos nível 2 para jogar esta atividade."
                    : "A atividade vai começar no seu canal de voz atual."
                }`,
              })
              .setColor(activities[activity].color),
          ],
          components: [
            this.client.ButtonRow([
              {
                url: invite.code,
                label: activities[activity].name,
                style: "LINK",
                emoji: activities[activity].emoji,
              },
            ]),
          ],
        });
      });
  }
};
