const axios = require("axios");

module.exports = {
  config: {
    name: "jan",
    version: "1.4.0",
    author: "Aminulsordar",
    countDown: 0,
    role: 0,
    shortDescription: "Jan AI চ্যাটবট",
    longDescription: "Jan AI বট যেটা শেখানো যেতে পারে এবং প্রশ্নের উত্তর দিতে পারে।",
    category: "jan",
    guide: "{pn} <message>\n{pn} teach <question> - <answer>\n{pn} count"
  },

  async fetchCount() {
    try {
      const response = await axios.get(`https://jan-api-by-aminul-sordar.vercel.app/count`);
      return response.data;
    } catch (error) {
      return { questions: 0, answers: 0 };
    }
  },

  async getAnswer(question) {
    try {
      const response = await axios.get(`https://jan-api-by-aminul-sordar.vercel.app/answer/${encodeURIComponent(question)}`);
      return response.data.answer || "❌ আমি এখনো এটা শিখিনি, দয়া করে আমাকে শেখান! 👀";
    } catch (error) {
      return "❌ সার্ভার থেকে উত্তর পাওয়া যায়নি, পরে আবার চেষ্টা করুন!";
    }
  },

  async teachMultiple(qaText) {
    try {
      const response = await axios.post(`https://jan-api-by-aminul-sordar.vercel.app/teach`, { text: qaText });
      return response.data.message;
    } catch (error) {
      return "❌ শেখানো ব্যর্থ হয়েছে! সার্ভার সমস্যা হতে পারে।";
    }
  },

  onReply: async function ({ api, event }) {
    const reply = event.body.trim();
    const responseMessage = await this.getAnswer(reply);

    await api.sendMessage(responseMessage, event.threadID, (error, info) => {
      if (!error) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID
        });
      }
    }, event.messageID);
  },

  onStart: async function ({ api, args, event }) {
    if (args.length < 1) {
      return api.sendMessage("❌ দয়া করে একটি প্রশ্ন করুন!", event.threadID, event.messageID);
    }

    const command = args[0].toLowerCase();

    if (command === "count") {
      const countData = await this.fetchCount();
      return api.sendMessage(
        `📊 জ্ঞানভাণ্ডার:\n\n` +
        `📌 মোট প্রশ্ন: ${countData.questions}\n` +
        `📌 মোট উত্তর: ${countData.answers}\n\n` +
        `💡 আমাকে আরও শেখানোর মাধ্যমে আমাকে আরও স্মার্ট বানান!\n` +
        `🔍 কিছু প্রশ্ন করুন, আমি চেষ্টা করব উত্তর দেওয়ার!`,
        event.threadID, event.messageID
      );
    }

    if (command === "teach") {
      const input = args.slice(1).join(" ").trim();
      if (!input.includes(" - ")) {
        return api.sendMessage("❌ সঠিক ফরম্যাট ব্যবহার করুন:\n/teach question - answer\nআপনি একাধিক প্রশ্ন একসাথে দিতে পারেন '|'-এর মাধ্যমে", event.threadID, event.messageID);
      }

      const responseMessage = await this.teachMultiple(input);
      return api.sendMessage(responseMessage, event.threadID, event.messageID);
    }

    const input = args.join(" ").trim();
    const responseMessage = await this.getAnswer(input);

    await api.sendMessage(responseMessage, event.threadID, (error, info) => {
      if (!error) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID
        });
      }
    }, event.messageID);
  },

  onChat: async function ({ api, event }) {
    try {
      const body = event.body ? event.body.toLowerCase().trim() : "";

      const prefixes = ["baby", "bby", "bot", "jan", "babu", "janu"];
      const startsWithPrefix = prefixes.find(prefix => body.startsWith(prefix));

      if (startsWithPrefix) {
        const question = body.replace(/^\S+\s*/, "").trim();

        if (question.length > 0) {
          const responseMessage = await this.getAnswer(body);
          return api.sendMessage(responseMessage, event.threadID, (error, info) => {
            if (!error) {
              global.GoatBot.onReply.set(info.messageID, {
                commandName: this.config.name,
                type: "reply",
                messageID: info.messageID,
                author: event.senderID
              });
            }
          }, event.messageID);
        }

        const randomReplies = [
          "😚",
          "হ্যাঁ 😀, আমি এখানে আছি",
          "কেমন আছো?",
          "বলো জান কি করতে পারি তোমার জন্য",
          `তুমি বলেছো: "${body}"? কিউট!`
        ];
        const randomReply = randomReplies[Math.floor(Math.random() * randomReplies.length)];
        return api.sendMessage(randomReply, event.threadID, event.messageID);
      }
    } catch (err) {
      console.error("onChat error:", err);
    }
  }
};
