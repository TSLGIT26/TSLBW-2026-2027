const {
    Client,
    GatewayIntentBits,
    EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");
require("dotenv").config();

// =========================
// CONFIG
// =========================
const configPath = path.join(__dirname, "config", "config.json");
const counterPath = path.join(__dirname, "data", "join-counter.json");

if (!fs.existsSync(configPath)) {
    console.error("❌ Không tìm thấy config/config.json");
    process.exit(1);
}

const config = JSON.parse(
    fs.readFileSync(configPath, "utf8")
);

// =========================
// COUNTER
// =========================
function loadCounter() {
    if (!fs.existsSync(counterPath)) {
        fs.mkdirSync(path.dirname(counterPath), { recursive: true });

        fs.writeFileSync(
            counterPath,
            JSON.stringify({ totalJoined: 0 }, null, 2),
            "utf8"
        );
    }

    try {
        return JSON.parse(
            fs.readFileSync(counterPath, "utf8")
        );
    } catch (error) {
        console.error("❌ Lỗi đọc join-counter.json:", error);
        return { totalJoined: 0 };
    }
}

function saveCounter(data) {
    fs.writeFileSync(
        counterPath,
        JSON.stringify(data, null, 2),
        "utf8"
    );
}

// =========================
// DATE
// =========================
function getVietnamDate() {
    return new Intl.DateTimeFormat("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(new Date());
}

// =========================
// DISCORD CLIENT
// =========================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// =========================
// READY
// =========================
client.once("ready", () => {
    console.log("=================================");
    console.log(`🇻🇳 ${config.bot.name}`);
    console.log(`🤖 Bot: ${client.user.tag}`);
    console.log("✅ TSLBW 2026-2027 ONLINE!");
    console.log("=================================");
});

// =========================
// MEMBER JOIN
// =========================
client.on("guildMemberAdd", async (member) => {
    try {
        const counter = loadCounter();

        counter.totalJoined += 1;

        saveCounter(counter);

        const number = counter.totalJoined;
        const date = getVietnamDate();

        const channel = member.guild.channels.cache.get(
            config.server.welcomeChannelId
        );

        if (!channel) {
            console.error("❌ Không tìm thấy kênh Welcome!");
            return;
        }

        const welcomeText = config.messages.welcome.content
            .replaceAll("{user}", `<@${member.id}>`)
            .replaceAll("{number}", number)
            .replaceAll("{date}", date)
            .replaceAll("{userId}", member.id);

        const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("🇻🇳 Chào Mừng Thành Viên Mới")
            .setDescription(welcomeText)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({
                text: "TSLBW 2026-2027 • Server Tristan 🇻🇳"
            });

        await channel.send({
            content: `🇻🇳 Chào mừng <@${member.id}>!`,
            embeds: [embed]
        });

        console.log(
            `✅ ${member.user.tag} đã gia nhập | Thành viên thứ ${number}`
        );
    } catch (error) {
        console.error("❌ Lỗi guildMemberAdd:", error);
    }
});

// =========================
// MEMBER LEAVE
// =========================
client.on("guildMemberRemove", async (member) => {
    try {
        const channel = member.guild.channels.cache.get(
            config.server.goodbyeChannelId
        );

        if (!channel) {
            console.error("❌ Không tìm thấy kênh Goodbye!");
            return;
        }

        const goodbyeText = config.messages.goodbye.content
            .replaceAll("{user}", `<@${member.id}>`)
            .replaceAll("{userId}", member.id);

        const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("🇻🇳 Tạm Biệt Bạn")
            .setDescription(goodbyeText)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({
                text: "TSLBW 2026-2027 • Server Tristan 🇻🇳"
            });

        await channel.send({
            embeds: [embed]
        });

        console.log(
            `👋 ${member.user.tag} đã rời server.`
        );
    } catch (error) {
        console.error("❌ Lỗi guildMemberRemove:", error);
    }
});

// =========================
// LOGIN
// =========================
if (!process.env.DISCORD_TOKEN) {
    console.error("❌ Chưa có DISCORD_TOKEN trong file .env");
    process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);