const { Event } = require("sheweny");

module.exports = class messageReactionAddTracker extends Event {
  constructor(client) {
    super(client, "messageReactionAdd", {
      description: "Rastreie as reações adicionadas às mensagens",
    });
  }
  async execute(messageReaction, user) {
    if (user.bot || user == null) return;
    const { guild } = messageReaction.message;

    const fetchGuild = await this.client.GetGuild(guild);

    const msgId = fetchGuild.roleClaim.message;
    if (messageReaction.message.id !== msgId) return;

    const emoji = messageReaction._emoji.name;
    const customEmoji = await this.client.FindCustomEmoji(emoji);
    const emojiName = customEmoji
      ? customEmoji
      : this.client.GetEmojiNameFromUni(emoji);

    const roleId = fetchGuild.roleClaim.fields.filter(
      (r) => r.emojiName == emojiName
    )[0].roleId;

    const role = guild.roles.cache.find((r) => r.id === roleId);
    const member = guild.members.cache.find((m) => m.id === user.id);

    member.roles.add(role).catch(() => undefined);
  }
};
