const config = require("../config.json");
const low = require("lowdb");
const { customAlphabet } = require("nanoid");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync(config.db.file);
const db = low(adapter);
const nanoid = customAlphabet("1234567890abcdef", 10);

db.defaults({ faqs: [], tags: [] }).write();

const models = {
  faqs: {
    delete: function(_id) {
      _id = _id.toLowerCase();
      const record = db.get("faqs").find({ _id }).value();
      db.get("faqs").remove({ _id }).write();
      return record;
    },
    getAll: function() {
      const records = db.get("faqs").value();
      for (const record of records) {
        record.trigger = RegExp(record._source, record._flags);
      }
      return records;
    },
    getByGuild: function(guildId) {
      guildId = guildId.guild?.id ?? guildId.id ?? guildId;
      const records = db.get("faqs").filter({ guildId }).value();
      for (const record of records) {
        record.trigger = RegExp(record._source, record._flags);
      }
      return records;
    },
    getById: function(_id) {
      _id = _id.toLowerCase();
      const record = db.get("faqs").find({ _id }).value();
      record.trigger = RegExp(record._source, record._flags);
      return record;
    },
    save: function(data) {
      data.guildId = data.guildId.guild?.id ?? data.guildId.id ?? data.guildId;
      const entry = {
        _id: data._id?.toLowerCase() ?? nanoid(),
        guildId: data.guildId,
        _source: data.trigger.source,
        _flags: data.trigger.flags,
        response: data.response
      };

      if (data._id) {
        const record = db.get("faqs").find({ _id: data._id.toLowerCase() });
        if (record.value()) {
          record.assign(entry).write();
          entry.trigger = data.trigger;
          return entry;
        }
      }
      db.get("faqs").push(entry).write();
      entry.trigger = data.trigger;
      return entry;
    }
  },
  tags: {
    delete: function(tag, guildId) {
      guildId = guildId.guild?.id ?? guildId.id ?? guildId;
      tag = tag.toLowerCase();
      const record = db.get("tags").find({ tag, guildId }).value();
      db.get("tags").remove({ tag, guildId }).write();
      return record;
    },
    getAll: function() {
      return db.get("tags").value();
    },
    getByGuild: function(guildId) {
      guildId = guildId.guild?.id ?? guildId.id ?? guildId;
      return db.get("tags").filter({ guildId }).value();
    },
    get: function(tag, guildId) {
      data.guildId = data.guildId.guild?.id ?? data.guildId.id ?? data.guildId;
      tag = tag.toLowerCase();
      return db.get("tags").find({ tag, guildId }).value();
    },
    getTag: function(tag, guildId) {
      guildId = guildId.guild?.id ?? guildId.id ?? guildId;
      return db.get("tags").find({ guildId, tag }).value();
    },
    save: function(data) {
      data.guildId = data.guildId.guild?.id ?? data.guildId.id ?? data.guildId;
      data.tag = data.tag.toLowerCase();
      const entry = {
        tag: data.tag,
        guildId: data.guildId,
        response: data.response
      };
      db.get("tags").remove({ tag: data.tag, guildId: data.guildId }).write();
      db.get("tags").push(entry).write();
      return entry;
    }
  }
};

module.exports = models;
