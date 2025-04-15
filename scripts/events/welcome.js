const { getTime } = global.utils;

module.exports = {
	config: {
		name: "groupEventsBN",
		version: "2.1",
		author: "Royal Custom by ChatGPT",
		category: "events"
	},

	onStart: async ({ api, message, event }) => {
		const { threadID, logMessageType, logMessageData, type, body, reaction } = event;

		const threadInfo = await api.getThreadInfo(threadID);
		const memberCount = threadInfo.participantIDs.length;
		const adminCount = threadInfo.adminIDs.length;
		const currentTime = new Date().toLocaleTimeString("bn-BD");
		const joinDate = new Date().toLocaleDateString("bn-BD", {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
		const uptime = process.uptime();
		const hours = Math.floor(uptime / 3600);
		const minutes = Math.floor((uptime % 3600) / 60);
		const prefix = global.utils.getPrefix(threadID);

		// --- Bot Added Message ---
		if (logMessageType === "log:subscribe") {
			const botJoin = logMessageData.addedParticipants.find(p => p.userFbId == api.getCurrentUserID());
			if (botJoin) {
				const msg =
`━━━━━━━━━━━━━━━━━━
🤖 ধন্যবাদ আমাকে যুক্ত করার জন্য 🤖
━━━━━━━━━━━━━━━━━━

✅ বট Prefix: ${prefix}
📜 সকল কমান্ড দেখতে লিখুন: ${prefix}help

আমার সাথে মজা করতে প্রস্তুত তো?
━━━━━━━━━━━━━━━━━━`;
				return message.send(msg);
			}

			// --- Welcome Member ---
			const newUser = logMessageData.addedParticipants[0];
			const userName = newUser.fullName;
			const userID = newUser.userFbId;

			const welcomeMsg =
`━━━━━━━━━━━━━━━━━━
🌟 নতুন অতিথি 🌟
━━━━━━━━━━━━━━━━━━

স্বাগতম, ${userName}!

আপনি হচ্ছেন আমাদের ${memberCount} তম সদস্য।

📅 জয়েন করেছেন: ${joinDate}
⏱️ বট অনলাইন আছে: ${hours} ঘন্টা ${minutes} মিনিট
👥 মোট সদস্য: ${memberCount} জন
🛡️ এডমিন সংখ্যা: ${adminCount} জন

আশা করি এই গ্রুপে আপনার সময়টা দারুণ কাটবে!

━━━━━━━━━━━━━━━━━━`;

			return message.send({
				body: welcomeMsg,
				mentions: [{ tag: userName, id: userID }]
			});
		}

		// --- Member Left ---
		if (logMessageType === "log:unsubscribe") {
			const leftID = logMessageData.leftParticipantFbId;
			if (leftID == api.getCurrentUserID()) return;
			return message.send(`বাই বাই... কেউ গ্রুপ ছেড়ে চলে গেল! আবার দেখা হবে ইনশাআল্লাহ!`);
		}

		// --- Group Name Changed ---
		if (logMessageType === "log:thread-name") {
			const newName = logMessageData.name;
			return message.send(`⚠️ গ্রুপের নাম এখন "${newName}" রাখা হয়েছে! দারুণ নাম!`);
		}

		// --- Nickname Changed ---
		if (logMessageType === "log:thread-nickname") {
			const newNick = logMessageData.nickname;
			const changedFor = logMessageData.participant_id;
			return message.send(`${changedFor} এর নতুন nickname: "${newNick}" রাখা হয়েছে!`);
		}

		// --- Emoji Changed ---
		if (logMessageType === "log:thread-icon") {
			const emoji = logMessageData.icon;
			return message.send(`গ্রুপের ইমোজি এখন: ${emoji}`);
		}

		// --- Call Started ---
		if (logMessageType === "log:call") {
			return message.send("📞 কল শুরু হয়েছে! সবাই জয়েন হও ভাইরা!");
		}

		// --- Call Ended ---
		if (logMessageType === "log:call-ended") {
			const dur = logMessageData.callDuration;
			const m = Math.floor(dur / 60);
			const s = dur % 60;
			return message.send(`📴 কল শেষ! মোট সময়: ${m} মিনিট ${s} সেকেন্ড!`);
		}

		// --- Reaction Detection (😂) ---
		if (type === "message_reaction" && reaction === "😂") {
			return message.send("মজা পাইলা বুঝি?");
		}

		// --- Tag All Members if @everyone ---
		if (type === "message" && body?.toLowerCase().includes("@everyone")) {
			const mentions = threadInfo.participantIDs.map(id => ({
				id, tag: " "
			}));
			return message.send({
				body: `@everyone বলেছেন! সবাই একবার দেখে নাও!`,
				mentions
			});
		}
	}
};
