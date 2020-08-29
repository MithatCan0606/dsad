const Discord = require("discord.js")
const fs = require("fs")
const config = JSON.parse(fs.readFileSync("./config.json", { encoding: "utf8" }))
const moment = require("moment")
const low = require("lowdb")
const FileSync = require("lowdb/adapters/FileSync")
const ascii = require("ascii-table")
const humanizeDuration = require("humanize-duration")
const wait = require('util').promisify(setTimeout)
const { dateFormat, hasPerm, noPermMsg, sendUsageEmbed } = require("./functions.js")

class Client extends Discord.Client {
    constructor() {
        super()
        this.token = config.token
        this.prefix =  config.prefix
        this.authors = new Set(config.authors)
        this.database = low(new FileSync("database.json"))
        this.commands = new Discord.Collection()
        this.aliases = new Discord.Collection()
        this.categories = fs.readdirSync("./commands/")
        this.category_folders = new Discord.Collection()
        this.awaitmsg = new Discord.Collection()
    }
    log(text) {
        return console.log(`(${moment().format('YYYY-MM-DD HH:mm')}) [BOT] ${text}`)
    }
    err(text) {
        return console.error(`(${moment().format('YYYY-MM-DD HH:mm')}) HATA! [BOT] ${text}`)
    }
}

fs.readdir("./commands/", async(err, files) => {
    if(err) return client.err(`${err}`)
    if(!files.length) return client.log("Herhangi bir komut listesi bulunamadı.")
    let table = new ascii("Komut Listesi")
    table.setHeading("Komut Dosyası", "Komut Bilgileri", "Aktifleştirme Durumu")
    files.forEach(dir => {
        const commands = fs.readdirSync(`./commands/${dir}/`).filter(file => file.endsWith(".js"))
        if(!commands.length || !(commands.length > 0)) return client.log("\"" + dir + "\" komut listesinde herhangi bir komut bulunamadı.")
        for (let f of commands) {
            const file = require(`./commands/${dir}/${f}`);
            const props = new file(client);
            if(props.cmdOptions.name) {
                if(client.commands.has(props.cmdOptions.name)) return client.err(`"${props.cmdOptions.name}" adlı komut zaten yüklenmiş ve "${f}" dosyası bu komutu içerdiği için komut yüklenemedi.`)
                table.addRow(`${f}`, `Komut: ${props.cmdOptions.name} | Komut Kısayolları: ${props.cmdOptions.aliases.join(", ")} | Komut Kategorisi: ${props.cmdOptions.category || dir}`, "✅")
                client.category_folders.set(props.cmdOptions.name, dir)
                client.commands.set(props.cmdOptions.name, props)
                if(props.cmdOptions.aliases && Array.isArray(props.cmdOptions.aliases) && props.cmdOptions.aliases.length >= 1) {
                    props.cmdOptions.aliases.forEach(alias => client.aliases.set(alias, props.cmdOptions.name))
                }
                if(typeof props.onLoad === "function") props.onLoad(client)
            } else {
                table.addRow(f, "❌", `❌ -> Komut ayarları yapılandırılmamış.`)
            }
        }
    })
    if(client.commands.size >= 1) console.log(table.toString())
})

const client = new Client()

client.on("ready", async() => {
    await wait(1000);
    let guild = await client.guilds.cache.get(config.guildID)
    if(!guild.me.voice.channel) guild.channels.cache.get(config.bot_ses_kanal).join().catch(err => { })
    if(!client.database.has(`guilds.${guild.id}.basvurular`).value()) await client.database.set(`guilds.${guild.id}.basvurular`, []).write()
    if(!client.database.has(`guilds.${guild.id}.cevaplar`).value()) await client.database.set(`guilds.${guild.id}.cevaplar`, []).write()
    client.user.setPresence({ status: "idle", activity: { name: config.activity_text, type: "PLAYING" }})
    client.log(`${client.user.username} Discord botu aktif hale getirildi!`)
    for await(const [, guild] of client.guilds.cache.filter(g => g.id !== config.guildID)) {
        await guild.leave()
    }
})

client.on('raw', async packet => {
    if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
    let guild = client.guilds.cache.get(packet.d.guild_id)
    let channel = guild.channels.cache.get(packet.d.channel_id)
    let member = await guild.members.fetch(packet.d.user_id)
    if (channel.messages.cache.has(packet.d.message_id)) return;
    channel.messages.fetch(packet.d.message_id).then(message => {
        let emoji = packet.d.emoji.id ? packet.d.emoji.id : packet.d.emoji.name;
        const reaction = message.reactions.cache.get(emoji);
        if(reaction) reaction.users.cache.set(member.user.id, member.user);
        if (packet.t === 'MESSAGE_REACTION_ADD') {
            client.emit("messageReactionAdd", reaction, member.user);
        }
        if (packet.t === 'MESSAGE_REACTION_REMOVE') {
            client.emit("messageReactionRemove", reaction, member.user);
        }
    });
})

client.on("message", async message => {
    if(message.author.bot) return;
    if(!message.content.startsWith((client.database.has(`guilds.${message.guild.id}.prefix`).value() ? client.database.get(`guilds.${message.guild.id}.prefix`).value() : client.prefix))) return;
    let params = message.content.slice((client.database.has(`guilds.${message.guild.id}.prefix`).value() ? client.database.get(`guilds.${message.guild.id}.prefix`).value() : client.prefix).length).trim().split(/ +/g)
    let command = params[0].toLowerCase()
    let args = params.slice(1)
    let cArgs = params.join(" ").toLowerCase().split(/ +/g).slice(1)
    let cmd;
    if (client.commands.has(command)) {
        cmd = client.commands.get(command);
    } else if(client.aliases.has(command)) {
        cmd = client.commands.get(client.aliases.get(command));
    }
    if (!cmd) return;
    if(!cmd.cmdConfig.enabled && cmd.cmdConfig.enabled !== true) return;
    if(cmd.cmdConfig.guildOnly === true && message.guild === null) return;
    if(cmd.cmdConfig.members && cmd.cmdConfig.members.size >= 1 && !cmd.cmdConfig.members.has(message.author.id)) return noPermMsg(message, "author")
    if(message.member.hasPermission("ADMINISTRATOR")) return cmd.run(client, message, args, cArgs)
    if(cmd.cmdConfig.requiredPerm && hasPerm(message.member, cmd.cmdConfig.requiredPerm) !== true) noPermMsg(message, hasPerm(message.member, cmd.cmdConfig.requiredPerm))
    //if(cmd.cmdConfig.cooldown && cmd.cmdConfig.cooldown > 0) { return; }
    return cmd.run(client, message, args, cArgs)
})

client.on("voiceStateUpdate", async(oldState, newState) => {
    if(newState.member.user.id !== client.user.id) return;
    if(!newState.member.voice || !newState.member.voice.channel) return newState.guild.channels.cache.get(config.bot_ses_kanal).join().catch(err => { })
})

client.login(client.token)

function roleNameConverter(roleName) {
    if(roleName === "ADMINISTRATOR") return "YÖNETİCİ"
    if(roleName === "CREATE_INSTANT_INVITE") return "DAVET_OLUŞTUR"
    if(roleName === "KICK_MEMBERS") return "KULLANICILARI AT"
    if(roleName === "BAN_MEMBERS") return "KULLANICILARI YASAKLA"
    if(roleName === "MANAGE_CHANNELS") return "KANALLARI YÖNET"
    if(roleName === "MANAGE_GUILD") return "SUNUCUYU YÖNET"
    if(roleName === "ADD_REACTIONS") return "EMOJİ EKLE"
    if(roleName === "VIEW_AUDIT_LOG") return "DENETİM KAYDINI GÖR"
    if(roleName === "PRIORITY_SPEAKER") return "ÖNCELİKLİ KONUŞMACI"
    if(roleName === "STREAM") return "YAYIN"
    if(roleName === "VIEW_CHANNEL") return "KANALLARI GÖR"
    if(roleName === "SEND_MESSAGES") return "MESAJ GÖNDER"
    if(roleName === "SEND_TTS_MESSAGES") return "METİN OKUMA MESAJI GÇNDERME"
    if(roleName === "MANAGE_MESSAGES") return "MESAJLARI YÖNET"
    if(roleName === "EMBED_LINKS") return "EMBED LINKS"
    if(roleName === "ATTACH_FILES") return "DOSYA EKLE"
    if(roleName === "READ_MESSAGE_HISTORY") return "MESAJ GEÇMİŞİNİ OKU"
    if(roleName === "MENTION_EVERYONE") return "HERKESTEN BAHSET"
    if(roleName === "USE_EXTERNAL_EMOJIS") return "HARİCİ EMOJİLER KULLAN"
    if(roleName === "USE_EXTERNAL_EMOJIS") return "HARİCİ EMOJİLER KULLAN"
    if(roleName === "VIEW_GUILD_INSIGHTS") return "VIEW GUILD INSIGHTS"
    if(roleName === "CONNECT") return "BAĞLAN"
    if(roleName === "SPEAK") return "KONUŞ"
    if(roleName === "MUTE_MEMBERS") return "KULLANICILARI SUSTUR"
    if(roleName === "MOVE_MEMBERS") return "KULLANICILARI TAŞI"
    if(roleName === "USE_VAD") return "USE VAD"
    if(roleName === "CHANGE_NICKNAME") return "KULLANICI ADI DEĞİŞTİR"
    if(roleName === "MANAGE_NICKNAMES") return "KULLANICI ADLARINI YÖNET"
    if(roleName === "MANAGE_ROLES") return "ROLLERİ YÖNET"
    return "BULUNAMADI"
}

String.prototype.replaceAll = function(find, replace) {
    return this.replace(new RegExp(find, 'g'), replace);
}