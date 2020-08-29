const Discord = require("discord.js")
const Command = require('../../utils/Command.js')
const { sendUsageEmbed, dateFormat, promptMessage } = require("../../functions.js")

const fs = require("fs")
const config = JSON.parse(fs.readFileSync("./config.json", { encoding: "utf8" }))
const wait = require('util').promisify(setTimeout)

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "kapat",
            aliases: [],
            usage: "kapat",
            description: "Başvuruları kapatır.",
            category: "moderasyon"
        }, {
            enabled: true,
            guildOnly: true,
            members: [],
            requiredPerm: 0,
            cooldown: 0
        })
    }
    onLoad(client) {
        return;
    }
    async run(client, message, args, cArgs) {
        if(!config.basvuru_yetkililer.some(r => message.member.roles.cache.has(r)) && !message.member.hasPermission("ADMINISTRATOR")) return message.channel.send(new Discord.MessageEmbed().setDescription(`❌ Bu komutu kullanmak için iznin yok, ${message.member}`).setAuthor(message.author.tag, message.author.avatarURL()).setTimestamp().setColor("RED")).then(m => m.delete({ timeout: 6000 }))
        if(!client.database.get(`guilds.${message.guild.id}.basvurular`).find({ kanal: message.channel.id }).value()) return message.channel.send(new Discord.MessageEmbed().setDescription(`Bu kanal başvuru kanalı olmadığı için kapatamazsın, ${message.member}`).setAuthor(message.author.tag, message.author.avatarURL()).setTimestamp().setColor("RED")).then(m => m.delete({ timeout: 6000 }))
		let bilgiler = client.database.get(`guilds.${message.guild.id}.basvurular`).value().filter(x => x.kanal === message.channel.id)[0]
		await message.channel.send(new Discord.MessageEmbed().setDescription(`Hey ${message.member}, **${bilgiler.kullanici}** ID'li kullanıcının başvurusunu kapatmayı onaylıyor musunuz?\n\n__(Onaylama işlemi için 30 saniye süre başlatıldı.)**`).setColor("BLACK")).then(async promptmsg => {
			const emoji = await promptMessage(promptmsg, message.author, 30, ["✅", "❌"])
            if(emoji === "✅") {
				await client.database.get(`guilds.${message.guild.id}.basvurular`).remove({ kullanici: bilgiler.kullanici }).write()
				await client.database.get(`guilds.${message.guild.id}.cevaplar`).remove({ kullanici: bilgiler.kullanici }).write()
				await message.guild.channels.cache.get(bilgiler.kanal).delete()
				return;
            } else if(emoji === "❌") {
				return promptmsg.delete()
			}
			return promptmsg.delete()
		})
    }
}