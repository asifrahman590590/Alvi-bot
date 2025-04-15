const axios = require("axios");

module.exports = {
  config: {
    name: "jan",
    version: "1.4.0",
    author: "SiamTheFrog",
    countDown: 0,
    role: 0,
    shortDescription: "Jan AI Chatbot",
    longDescription: "Jan AI Bot that can be taught and answer questions.",
    category: "jan",
    guide: "{pn} <message>\n{pn} teach <question> - <answer>\n{pn} count"
  },

  async fetchCount() {
    try {
      const response = await axios.get(`https://jan-api-v2-siamthefrog-0ud6.onrender.com/count`);
      return response.data;
    } catch (error) {
      return { questions: 0, answers: 0 };
    }
  },

  async getAnswer(question) {
    try {
      const response = await axios.get(`https://jan-api-v2-siamthefrog-0ud6.onrender.com/answer/${encodeURIComponent(question)}`);
      return response.data.answer || "❌ I haven't learned this yet, please teach me! 👀";
    } catch (error) {
      return "❌ Please teach me!";
    }
  },

  async teachMultiple(qaText) {
    try {
      const response = await axios.post(`https://jan-api-v2-siamthefrog-0ud6.onrender.com/teach`, { text: qaText });
      return response.data.message;
    } catch (error) {
      return "❌ Failed to teach!";
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
      return api.sendMessage("❌ Please ask a question!", event.threadID, event.messageID);
    }

    const command = args[0].toLowerCase();

    if (command === "count") {
      const countData = await this.fetchCount();
      return api.sendMessage(
        `📊 Knowledge Base:\n\n` +
        `📌 Total Questions: ${countData.questions}\n` +
        `📌 Total Answers: ${countData.answers}\n\n` +
        `💡 Keep teaching me to make me smarter!\n` +
        `🔍 Ask me anything, and I'll try my best to answer!`,
        event.threadID, event.messageID
      );
    }

    if (command === "teach") {
      const input = args.slice(1).join(" ").trim();
      if (!input.includes(" - ")) {
        return api.sendMessage("❌ Please use the correct format:\n/teach question - answer\nYou can add multiple questions using '|'", event.threadID, event.messageID);
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
  }
};
