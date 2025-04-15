module.exports = {
  config: {
    name: "up",
    aliases: ["uptime", "upt"],
    version: "2.0",
    author: "Aminulsordar",
    role: 0,
    shortDescription: {
      en: "Displays bot uptime and system information with enhanced details."
    },
    longDescription: {
      en: "Shows comprehensive information about the bot's uptime, system resources, performance metrics, and additional useful statistics."
    },
    category: "system",
    guide: {
      en: "Use {p}up to view detailed bot status and system information."
    }
  },

  onStart: async function ({ api, message, threadsData, usersData }) {
    try {
      const os = require("os");
      const moment = require("moment");
      const axios = require("axios");
      const uptime = os.uptime();
      const processUptime = process.uptime();

      // Enhanced uptime calculation
      const formatUptime = (seconds) => {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${days}d ${hours}h ${mins}m ${secs}s`;
      };

      // Get current date and time with timezone
      const now = moment();
      const date = now.format("MMMM Do YYYY");
      const time = now.format("h:mm:ss A");

      // System information
      const systemInfo = {
        platform: `${os.platform()} ${os.release()}`,
        architecture: os.arch(),
        cpu: `${os.cpus().length} cores (${os.cpus()[0].model})`,
        memory: {
          total: (os.totalmem() / (1024 ** 3)).toFixed(2) + " GB",
          free: (os.freemem() / (1024 ** 3)).toFixed(2) + " GB",
          used: ((os.totalmem() - os.freemem()) / (1024 ** 3)).toFixed(2) + " GB"
        },
        load: os.loadavg().map(load => load.toFixed(2)).join(", "),
        node: process.version
      };

      // Bot statistics
      const [allUsers, allThreads] = await Promise.all([
        usersData.getAll().then(users => users.length),
        threadsData.getAll().then(threads => threads.length)
      ]);

      // Process memory usage
      const memoryUsage = process.memoryUsage();
      const processMemory = {
        rss: (memoryUsage.rss / (1024 ** 2)).toFixed(2) + " MB",
        heapTotal: (memoryUsage.heapTotal / (1024 ** 2)).toFixed(2) + " MB",
        heapUsed: (memoryUsage.heapUsed / (1024 ** 2)).toFixed(2) + " MB",
        external: (memoryUsage.external / (1024 ** 2)).toFixed(2) + " MB"
      };

      // Ping calculation
      const startTime = Date.now();
      await message.reply("⏳ Calculating ping...");
      const endTime = Date.now();
      const ping = endTime - startTime;

      // Get a random inspirational quote
      let quote = "Stay positive and keep coding!";
      try {
        const quoteRes = await axios.get("https://api.quotable.io/random");
        quote = `"${quoteRes.data.content}" - ${quoteRes.data.author}`;
      } catch (e) {
        console.log("Failed to fetch quote:", e);
      }

      // Create response
      const response = `
🌟 𝗔𝗠𝗜𝗡𝗨𝗟-𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗨𝗦 𝗣𝗔𝗡𝗘𝗟 🌟

⏱️ 𝗦𝘆𝘀𝘁𝗲𝗺 𝗨𝗽𝘁𝗶𝗺𝗲: ${formatUptime(uptime)}
🤖 𝗕𝗼𝘁 𝗨𝗽𝘁𝗶𝗺𝗲: ${formatUptime(processUptime)}
📶 𝗣𝗶𝗻𝗴: ${ping}ms

👥 𝗨𝘀𝗲𝗿𝘀: ${allUsers}
💬 𝗧𝗵𝗿𝗲𝗮𝗱𝘀: ${allThreads}

🖥️ 𝗦𝘆𝘀𝘁𝗲𝗺 𝗜𝗻𝗳𝗼:
▸ 𝗢𝗦: ${systemInfo.platform}
▸ 𝗔𝗿𝗰𝗵: ${systemInfo.architecture}
▸ 𝗖𝗣𝗨: ${systemInfo.cpu}
▸ 𝗟𝗼𝗮𝗱: ${systemInfo.load}
▸ 𝗡𝗼𝗱𝗲.𝗷𝘀: ${systemInfo.node}

💾 𝗠𝗲𝗺𝗼𝗿𝘆:
▸ 𝗧𝗼𝘁𝗮𝗹: ${systemInfo.memory.total}
▸ 𝗨𝘀𝗲𝗱: ${systemInfo.memory.used}
▸ 𝗙𝗿𝗲𝗲: ${systemInfo.memory.free}
▸ 𝗕𝗼𝘁 𝗨𝘀𝗮𝗴𝗲: ${processMemory.rss} (RSS)

📅 ${date} | 🕒 ${time}

💬 ${quote}
      `.trim();

      // Send response with attractive image
      const imageUrl = "https://i.imgur.com/7I0lQf6.jpeg"; // Replace with your preferred image
      message.reply({
        body: response,
        attachment: await global.utils.getStreamFromURL(imageUrl)
      });

    } catch (error) {
      console.error("Error in uptime command:", error);
      message.reply("⚠️ An error occurred while processing the uptime command. Please try again later.");
    }
  }
};
