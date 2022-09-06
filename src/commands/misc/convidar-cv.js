const { Command } = require("sheweny");
const { ApplicationCommandOptionType } = require("discord.js");

module.exports = class InviteVocalCommand extends Command {
  constructor(client) {
    super(client, {
      name: "convidar-cv",
      type: "SLASH_COMMAND",
      description: "💌 Convide alguém para o seu canal de voz",
      examples:
        "/convidar-cv `member:@awoone#0001` => 📧 Envie um convite para se conectar no seu canal de voz",
      category: "Diversos",
      userPermissions: ["SendMessages"],
      clientPermissions: ["SendMessages"],       
      options: [
        {
          type: ApplicationCommandOptionType.User,
          name: "membro",
          description: "💡 O usuário a ser convidado",
          required: true,
        },
      ],
    });
  }
  async execute(interaction) {

    if (!(await this.client.Defer(interaction))) return;
    const { options, member, guild } = interaction;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel)
      return interaction.editReply("`🚫` Você não está em um canal de voz");

    const targetMember = options.getMember("membro");

    targetMember
      .send({
        embeds: [
          this.client
            .Embed()
            .setAuthor({
              name: "Convite recebido",
              iconURL: member.user.avatarURL({ dynamic: true }),
            })
            .setDescription(
              `${member} convidou você para <#${voiceChannel.id}>\n
              *💡Clique no nome do canal para participar*`
            )
            .setFooter({
              text: guild.name,
              iconURL: guild.iconURL({ dynamic: true }),
            }),
        ],
      })
      .catch(() => {
        return interaction.editReply(
          `\`🚫\` Não é possível enviar mensagem para ${targetMember.toString()}
          > 1. O usuário não aceita mensagens diretas,
          > 2. O usuário não está no mesmo servidor que o bot,
          > 3. O usuário bloqueou o bot.`
        );
      });

    interaction.editReply(`💌 Convite enviado para ${targetMember.toString()}`);
  }
};