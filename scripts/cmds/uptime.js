module.exports = {
  config: {
    name: "up",
    aliases: ["uptime", "upt"],
    version: "1.0",
    author: "𝗔𝗺𝗶𝗻𝘂𝗹 𝗦𝗼𝗿𝗱𝗮𝗿",
    role: 0,
    shortDescription: {
      en: "uptime robot",
    },
    longDescription: {
      en: "shows uptime of bot.",
    },
    category: "system",
    guide: {
      en: "Use {p}up to see uptime of bot.",
    },
  },

  onStart: async function ({ message }) {
    const os = require("os");
    const uptime = os.uptime();
    const days = Math.floor(uptime / (3600 * 24));
    const hours = Math.floor((uptime % (3600 * 24)) / 3600);
    const mins = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const uptimeString = `🟢 𝗕𝗼𝘁 𝗨𝗽𝘁𝗶𝗺𝗲: ${days} দিন, ${hours} ঘন্টা, ${mins} মিনিট, ${seconds} সেকেন্ড`;
    message.reply(uptimeString);
  },
};
