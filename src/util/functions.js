const {
  EmbedBuilder,
  SelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  time,
} = require("discord.js");
const prettyMilliseconds = require("pretty-ms");
const wait = require("node:util").promisify(setTimeout);
require("dotenv").config();
const dayjs = require("dayjs");
const nodeEmoji = require("node-emoji");
const { Guild } = require("../db-model");
const { rando } = require("@nastyox/rando.js");

module.exports = (client) => {
  client.Embed = (color = true) => {
    let embed = new EmbedBuilder();
    if (color) embed.setColor("#508fb0");
    return embed;
  };

  client.PrettyMs = (ms, option = { compact: true }) => {
    return prettyMilliseconds(ms, option);
  };

  client.SelectMenuRow = (
    customId,
    placeholder = null,
    options = null,
    amount = null
  ) => {
    let menuRow = new ActionRowBuilder().addComponents(
      new SelectMenuBuilder().setCustomId(customId)
    );
    if (placeholder) menuRow.components[0].setPlaceholder(placeholder);
    if (amount) {
      menuRow.components[0].setMinValues(amount.min);
      menuRow.components[0].setMaxValues(amount.max);
    }
    if (options) menuRow.components[0].addOptions(options);
    return menuRow;
  };

  client.ButtonRow = (buttons) => {
    let buttonRow = new ActionRowBuilder();
    buttons.forEach((btn) => {
      let button = new ButtonBuilder();
      if (btn.label) button.setLabel(btn.label);
      switch (btn.style) {
        case "SUCCESS":
          button.setStyle(ButtonStyle.Success);
          break;
        case "PRIMARY":
          button.setStyle(ButtonStyle.Primary);
          break;
        case "SECONDARY":
          button.setStyle(ButtonStyle.Secondary);
          break;
        case "DANGER":
          button.setStyle(ButtonStyle.Danger);
          break;
        case "LINK":
          button.setStyle(ButtonStyle.Link);
          break;
      }
      if (btn.emoji) button.setEmoji(btn.emoji);
      if (btn.url) button.setURL(btn.url);
      else button.setCustomId(btn.customId);
      buttonRow.addComponents(button);
    });
    return buttonRow;
  };

  client.ModalRow = (customId, title, textInput) => {
    const modal = new ModalBuilder().setCustomId(customId).setTitle(title);
    textInput.forEach((element) => {
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId(element.customId)
            .setLabel(element.label)
            .setStyle(element.style)
            .setPlaceholder(element.placeholder)
            .setRequired(element.required)
        )
      );
    });
    return modal;
  };

  client.Defer = async (interaction) => {
    await wait(500);
    let bool = true;
    await interaction.deferReply({ ephemeral: true }).catch(() => {
      bool = false;
    });
    return bool;
  };

  client.Wait = async (ms = 2000) => {
    await wait(ms);
  };

  client.Capitalize = (s) => {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  client.Formatter = (ms, option = "f") => {
    return time(dayjs(ms).unix(), option);
  };

  client.Truncate = (str, maxLength = 97) => {
    return str.length > maxLength ? str.substr(0, maxLength - 1) + "..." : str;
  };

  client.searchRandom = (arr) => {
    return rando(arr).value;
  };

  client.GetEmojiNameFromUni = (unicodeEmoji) => {
    return nodeEmoji.find(unicodeEmoji).key;
  };

  client.GetEmojiFromName = (emojiName) => {
    try {
      return nodeEmoji.find(emojiName).emoji;
    } catch (e) {
      return null;
    }
  };

  client.HasEmoji = (unicodeEmoji) => {
    return nodeEmoji.hasEmoji(unicodeEmoji);
  };

  client.FindCustomEmoji = async (emoji) => {
    const customEmoji = await client.emojis.cache.find((e) => e.name === emoji);
    if (customEmoji)
      return `<${customEmoji.animated ? "a" : ""}:${customEmoji.name}:${
        customEmoji.id
      }>`;
    return null;
  };

  client.IsValidEmoji = async (emojiName) => {
    const search = await client.emojis.cache.find(
      (e) => e.id === emojiName.split(":")[2].slice(0, -1)
    );

    return search ? true : false;
  };

  client.HighestRole = (guild, userId) => {
    try {
      return guild.members.cache.find((member) => member.id === userId).roles
        .highest.position;
    } catch (e) {
      return null;
    }
  };

  client.UpdateMemberCount = (guild, channelId, channelName) => {
    try {
      guild.channels.cache
        .get(channelId)
        .setName(`${channelName}: ${guild.memberCount}`);
    } catch (e) {}
  };

  client.UpdateActivity = (activity) => {
    client.user.setActivity(activity.name, { type: activity.type });
  };

  client.getGuild = async (guild) => {
    return await Guild.findOne({ id: guild.id });
  };

  client.createGuild = async (guild) => {
    const createGuild = new Guild({ id: guild.id });
    createGuild
      .save()
      .then(() =>
        console.log(
          `➕ Guild: ${guild.name} - ${guild.id} - ${guild.members.cache.size} usuários`
        )
      );
  };

  client.deleteGuild = async (guild) => {
    await Guild.deleteOne({ id: guild.id }).then(() =>
      console.log(
        `➖ Guild: ${guild.name} - ${guild.id} - ${guild.members.cache.size} usuários`
      )
    );
  };

  client.updateGuild = async (guild, settings) => {
    let guildData = await client.getGuild(guild);
    if (typeof guildData != "object") guildData = {};

    for (const key in settings) {
      if (key.includes(".") && key.split(".").length === 2) {
        if (guildData[key.split(".")[0]][key.split(".")[1]] != settings[key]) {
          guildData[key.split(".")[0]][key.split(".")[1]] = settings[key];
        }
      }
      else {
        if (guildData[key] != settings[key]) {
          guildData[key] = settings[key];
        }
      }
    }
    return guildData.updateOne(settings);
  };
};
