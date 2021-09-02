const Augur = require("augurbot"),
  u = require("../utils/utils");

const tags = new Map();
const allowedMentions = { repliedUser: false };

function runTag(old, msg) {
  msg = msg ?? old;
  if (!tags.has(msg.guild?.id)) return;

  const cmd = u.parse(msg);
  if (cmd && tags.get(msg.guild.id).has(cmd.command)) {
    const tag = tags.get(msg.guild.id).get(cmd.command);
    let response = tag.response
      .replace(/<@author>/ig, msg.member.toString())
      .replace(/<author>/ig, u.escapeText(msg.member.displayName));
    if (response.toLowerCase().includes("<@target>") || response.toLowerCase().includes("<target>")) {
      const mentions = u.userMentions(msg, true);
      if (mentions.size == 0) return msg.reply({ content: "You need to `@mention` a user with that command!", allowedMentions }).then(u.clean).catch(u.noop);
      const target = mentions.first();
      response = response.replace(/<@target>/ig, target.toString())
        .replace(/<target>/ig, u.escapeText(target.displayName));
    }
    return msg.reply({ content: response, allowedMentions }).catch(u.noop);
  }
}

const Module = new Augur.Module()
.addCommand({name: "tag",
  syntax: "<Tag Name> <Tag Response>",
  permissions: (msg) => msg.member?.permissions.has("MANAGE_GUILD"),
  process: (msg, suffix) => {
    if (suffix) {
      const args = suffix.split(" ");
      const newTag = args.shift().toLowerCase();
      const response = args.join(" ");
      if (response) {
        const entry = Module.db.tags.save({ tag: newTag, guildId: msg.guild.id, response });
        if (!tags.has(entry.guildId)) tags.set(entry.guildId, new Map());
        tags.get(entry.guildId).set(entry.tag, entry);
        msg.react("👌").catch(u.noop);
      } else if (tags.get(msg.guild.id)?.has(newTag)) {
        const entry = Module.db.tags.delete(newTag, msg.guild.id);
        tags.get(entry.guildId).delete(entry.tag);
        msg.react("👌").catch(u.noop);
      } else
        msg.reply({ content: `I couldn't find the tag \`${newTag}\` to remove.`, allowedMentions }).catch(u.noop);
    } else
      msg.reply({ content: "You need to tell me the tag name and intended response.", allowedMentions }).catch(u.noop);
  }
})
.addEvent("messageCreate", runTag)
.addEvent("messageUpdate", runTag)
.setInit(() => {
  const cmds = Module.db.tags.getAll();
  for (tag of cmds) {
    if (!tags.has(tag.guildId)) tags.set(tag.guildId, new Map());
    tags.get(tag.guildId).set(tag.tag, tag);
  }
});

module.exports = Module;
