const Discord = require("discord.js")
const Command = require('../../utils/Command.js')
const { sendUsageEmbed, dateFormat, promptMessage } = require("../../functions.js")

const fs = require("fs")
const config = JSON.parse(fs.readFileSync("./config.json", { encoding: "utf8" }))
const wait = require('util').promisify(setTimeout)

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "başvuru",
            aliases: [],
            usage: "başvuru",
            description: "Başvuru oluşturur.",
            category: "genel"
        }, {
            enabled: true,
            guildOnly: true,
            members: [],
            requiredPerm: 0,
            cooldown: 0
        })
    }
    onLoad(client) {
        client.on("message", async message => {
            if(!message.guild) return;
            if(client.database.get(`guilds.${message.guild.id}.basvurular`).find({ kullanici: message.author.id }).value()) {
                if(message.channel.id !== client.database.get(`guilds.${message.guild.id}.basvurular`).find({ kullanici: message.author.id }).value().kanal) return;
                if(client.database.get(`guilds.${message.guild.id}.basvurular`).find({ kullanici: message.author.id }).value().adim === 0) return message.delete()
                if(client.database.get(`guilds.${message.guild.id}.basvurular`).find({ kullanici: message.author.id }).value().adim === 1) {
                    await client.database.get(`guilds.${message.guild.id}.basvurular`).find({ kullanici: message.author.id }).assign({ adim: 2 }).write()
                    await client.database.get(`guilds.${message.guild.id}.cevaplar`).find({ kullanici: message.author.id }).assign({ cevap1: message.content }).write()
                    message.channel.send(`<a:death_yildizparlak:717492120403050548> - Kaç yaşındasın? ${message.member}`)
                } else if(client.database.get(`guilds.${message.guild.id}.basvurular`).find({ kullanici: message.author.id }).value().adim === 2) {
                    await client.database.get(`guilds.${message.guild.id}.basvurular`).find({ kullanici: message.author.id }).assign({ adim: 3 }).write()
                    await client.database.get(`guilds.${message.guild.id}.cevaplar`).find({ kullanici: message.author.id }).assign({ cevap2: message.content }).write()
                    message.channel.send(`<a:death_yildizparlak:717492120403050548> - Sunucumuz İçin Ne Yapabilirsiniz? ${message.member}`)
                } else if(client.database.get(`guilds.${message.guild.id}.basvurular`).find({ kullanici: message.author.id }).value().adim === 3) {
                    await client.database.get(`guilds.${message.guild.id}.basvurular`).find({ kullanici: message.author.id }).assign({ adim: 4 }).write()
                    await client.database.get(`guilds.${message.guild.id}.cevaplar`).find({ kullanici: message.author.id }).assign({ cevap3: message.content }).write()
                    message.channel.send(`<a:death_yildizparlak:717492120403050548> - Tecrübeleriniz Neler? ${message.member}`)
                } else if(client.database.get(`guilds.${message.guild.id}.basvurular`).find({ kullanici: message.author.id }).value().adim === 4) {
                    await client.database.get(`guilds.${message.guild.id}.basvurular`).find({ kullanici: message.author.id }).assign({ adim: 5 }).write()
                    await client.database.get(`guilds.${message.guild.id}.cevaplar`).find({ kullanici: message.author.id }).assign({ cevap4: message.content }).write()
                    message.channel.send(`<a:death_yildizparlak:717492120403050548> - Discorda Günlük Kaç Saat Girebiliyorsun? ${message.member}`)
                } else if(client.database.get(`guilds.${message.guild.id}.basvurular`).find({ kullanici: message.author.id }).value().adim === 5) {
                    await client.database.get(`guilds.${message.guild.id}.basvurular`).find({ kullanici: message.author.id }).assign({ adim: 6 }).write()
                    await client.database.get(`guilds.${message.guild.id}.cevaplar`).find({ kullanici: message.author.id }).assign({ cevap5: message.content }).write()
                    message.channel.send(`<a:death_yildizparlak:717492120403050548> - İnvite Yapabiliyor musun ? Yapıyorsan Örnek Verebilir misin? Şu Şekilde Örnek = Haftada 20 Kişi ${message.member}`)
                } else if(client.database.get(`guilds.${message.guild.id}.basvurular`).find({ kullanici: message.author.id }).value().adim === 6) {
                    await client.database.get(`guilds.${message.guild.id}.basvurular`).find({ kullanici: message.author.id }).assign({ adim: 7 }).write()
                    await client.database.get(`guilds.${message.guild.id}.cevaplar`).find({ kullanici: message.author.id }).assign({ cevap6: message.content }).write()
                    message.channel.send(`<a:death_yildizparlak:717492120403050548> - Bizi Neden Tercih Ettiniz Kısaca Açıklayınız? ${message.member}`)
                } else if(client.database.get(`guilds.${message.guild.id}.basvurular`).find({ kullanici: message.author.id }).value().adim === 7) {
                    await client.database.get(`guilds.${message.guild.id}.basvurular`).find({ kullanici: message.author.id }).assign({ adim: 8 }).write()
                    await client.database.get(`guilds.${message.guild.id}.cevaplar`).find({ kullanici: message.author.id }).assign({ cevap7: message.content }).write()
                    message.channel.send(`**Tüm soruları başarıyla cevapladınız, ${message.member}. Başvurunuz 5 saniye sonra oluşturulacaktır.**`)
                    await wait(2000)
                    message.channel.send(`**Başvurunuz 3 saniye sonra oluşturulacaktır, ${message.member}.**`)
                    await wait(1000)
                    message.channel.send(`**Başvurunuz 2 saniye sonra oluşturulacaktır, ${message.member}.**`)
                    await wait(1000)
                    message.channel.send(`**Başvurunuz 1 saniye sonra oluşturulacaktır, ${message.member}.**`)
                    await wait(1000)
                    await message.channel.bulkDelete(100)
                    await message.channel.send(
                      new Discord.MessageEmbed()
                      .setTitle("Yeni bir başvuru oluşturuldu!")
                      .setDescription(`**Başvuruyu Yapan Kullanıcı:** ${message.member} (**${message.author.id}**)\n**Başvurunun Oluşturulma Tarihi:** ${dateFormat(new Date(), "dd/mm/yyyy HH:MM")}`)
                      .addField(`İsminiz nedir?`, client.database.get(`guilds.${message.guild.id}.cevaplar`).find({ kullanici: message.author.id }).value().cevap1, false)
                      .addField(`Kaç yaşındasınız?`, client.database.get(`guilds.${message.guild.id}.cevaplar`).find({ kullanici: message.author.id }).value().cevap2, false)
                      .addField(`Sunucumuz için ne yapabilirsiniz?`, client.database.get(`guilds.${message.guild.id}.cevaplar`).find({ kullanici: message.author.id }).value().cevap3, false)
                      .addField(`Tecrübeleriniz neler?`, client.database.get(`guilds.${message.guild.id}.cevaplar`).find({ kullanici: message.author.id }).value().cevap4, false)
                      .addField(`Discorda günlük kaç saat girebiliyorsun?`, client.database.get(`guilds.${message.guild.id}.cevaplar`).find({ kullanici: message.author.id }).value().cevap5, false)
                      .addField(`İnvite yapabiliyor musun? Yapıyorsan örnek verebilir misin? Şu şekilde Örnek = Haftada 20 Kişi`, client.database.get(`guilds.${message.guild.id}.cevaplar`).find({ kullanici: message.author.id }).value().cevap6, false)
                      .addField(`Bizi neden tercih ettiniz kısaca açıklayınız? `, client.database.get(`guilds.${message.guild.id}.cevaplar`).find({ kullanici: message.author.id }).value().cevap7, false)
                      .setFooter(message.author.tag, message.author.avatarURL())
                    )
                    return message.channel.send(`${message.guild.roles.cache.get(message.guild.id)}`)
                }
            }
        })
    }
    async run(client, message, args, cArgs) {
        if(message.channel.id !== config.bot_komut_kanal) return message.reply(`bu komutu sadece ${message.guild.channels.cache.get(config.bot_komut_kanal)} kanalında kullanabilirsin!`).then(m => m.delete({ timeout: 6000 }))
		if(config.basvuru_yetkililer.some(r => message.member.roles.cache.has(r)) || message.member.hasPermission("ADMINISTRATOR")) return message.channel.send(`❌ Zaten yetkili olduğun için başvuru açamazsın, ${message.member}`).then(async m => {
			await m.delete({ timeout: 6000 })
			return message.delete()
		})
        await message.react("✅")
        if(client.database.get(`guilds.${message.guild.id}.basvurular`).find({ kullanici: message.author.id }).value()) {
            message.channel.send(`❌ En fazla 1 tane başvuru oluşturabilirsin, ${message.member}`).then(m => m.delete({ timeout: 5000 }))
        } else {
            message.guild.channels.create(`${message.author.username}`, { parent: config.basvuru_kategori, type: "text" }).then(async c => {
                await client.database.get(`guilds.${message.guild.id}.basvurular`).push({ kullanici: message.author.id, kanal: c.id, adim: 0}).write()
                await client.database.get(`guilds.${message.guild.id}.cevaplar`).push({  kanal: c.id, kullanici: message.author.id, cevap1: "x", cevap2: "x", cevap3: "x", cevap4: "x", cevap5: "x", cevap6: "x", cevap7: "x"}).write()
                await c.updateOverwrite(message.guild.id, {
                    VIEW_CHANNEL: false,
                    SEND_MESSAGES: false
                })
                await c.updateOverwrite(message.author, {
                    VIEW_CHANNEL: true,
                    SEND_MESSAGES: true
                })
                config.basvuru_yetkililer.forEach(async roleid => {
                    await c.updateOverwrite(roleid, {
                        VIEW_CHANNEL: true,
                        SEND_MESSAGES: true
                    })
                })
                message.channel.send(`**Hey ${message.member}, başvuru kanalın ${c} olarak oluşturuldu!** <a:querencia_onay:717464917636022373>`)
                await c.send(`Hoş Geldin ${message.member}, Eğer Yetkili Olmak İstiyorsan İlk Önce ${config.sunucu_tag} Tagımızı Alarak Başlayabilirsiniz.
Şimdi Yetkili Başvurunu Kabul Etmeden Önce Senin Hakkında Daha Çok Bilgi Öğrenmeliyim.
Başvuruya Başlamak İçin ✅ Emojesine Basın.
\`Not: Başvuru Yaparken Tek Mesaj Halinde Cevap Veriniz. Bütün Soruları Cevaplamak İçin 5 Dakikanız Var.\``).then(async promptmsg => {
                  const emoji = await promptMessage(promptmsg, message.author, 300, ["✅", "❌"])
                  if(emoji === "✅") {
                      await client.database.get(`guilds.${message.guild.id}.basvurular`).find({ kullanici: message.author.id }).assign({ adim: 1 }).write()
                      await promptmsg.delete()
                      return c.send(`<a:death_yildizparlak:717492120403050548> - Öncellikle İsmin Nedir? ${message.member}`)
                  } else if(emoji === "❌") {
                      await client.database.get(`guilds.${message.guild.id}.basvurular`).remove({ kullanici: message.author.id }).write()
                      await client.database.get(`guilds.${message.guild.id}.cevaplar`).remove({ kullanici: message.author.id }).write()
                      return c.delete()
                  }
                  await client.database.get(`guilds.${message.guild.id}.cevaplar`).remove({ kullanici: message.author.id }).write()
                  await client.database.get(`guilds.${message.guild.id}.basvurular`).remove({ kullanici: message.author.id }).write()
                  return c.delete()
                })
            })
        }
    }
}