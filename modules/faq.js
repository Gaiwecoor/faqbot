const Augur = require("augurbot"),
  { Collection, MessageEmbed } = require("discord.js"),
  u = require("../utils/utils");

const faqs = new Map();

const allowedMentions = { repliedUser: false };

function checkFaq(old, msg) {
  msg = msg ?? old;
  if (!faqs.has(msg.guild?.id)) return;

  for (const [_id, faq] of faqs.get(msg.guild.id)) {
    const match = msg.cleanContent.match(faq.trigger);

    if (match) {
      const embed = new MessageEmbed()
      .setTimestamp()
      .setColor(Module.config.color)
      //.setAuthor(msg.member?.displayName ?? msg.author.username, msg.author.displayAvatarURL({size: 32}))
      .setFooter(`Match: \`/${faq._source}/${faq._flags}\`\nId: ${faq._id}`)
      .setDescription(faq.response);

      msg.reply({ embeds: [embed], allowedMentions }).catch(u.noop);
    }
  }
}

const Module = new Augur.Module()
.addCommand({name: "setfaq",
  permissions: (msg) => msg.member?.permissions.has("MANAGE_GUILD"),
  syntax: "/regexp/flags response",
  process: (msg, suffix) => {
    const exp = /^(\w{10} )?\/(.*)\/(\w*) (.*)$/;
    const match = suffix.match(exp);

    if (suffix.length == 10) {
      const entry = Module.db.faqs.delete(suffix);
      if (entry) {
        msg.reply({ content: `FAQ ${suffix} removed.`, allowedMentions }).then(u.clean).catch(u.noop);
        faqs.get(entry.guildId).delete(entry._id);
      } else msg.reply({ content: `I couldn't find that FAQ to remove!`, allowedMentions }).then(u.clean).catch(u.noop);
      return;
    } else if (!match) {
      msg.reply("I couldn't understand that. Try using `FAQ_ID /RegExp/Flags Your Response` (FAQ_ID optional).").then(u.clean).catch(u.noop);
      return;
    }

    const [, id, source, flags, response] = match;
    const entry = Module.db.faqs.save({
      _id: id?.trim(),
      guildId: msg.guild.id,
      trigger: RegExp(source, flags),
      response
    });
    if (!faqs.has(entry.guildId)) faqs.set(entry.guildId, new Map());
    faqs.get(entry.guildId).set(entry._id, entry);

    msg.reply({ content: `I saved the FAQ with id: \`${entry._id}\`.`, allowedMentions }).then(u.clean).catch(u.noop);
  }
})
.addEvent("messageCreate", checkFaq)
.addEvent("messageUpdate", checkFaq)
.setInit(() => {
  const records = Module.db.faqs.getAll();
  for (const record of records) {
    if (!faqs.has(record.guildId)) faqs.set(record.guildId, new Map());
    faqs.get(record.guildId).set(record._id, record);
  }
});

module.exports = Module;
