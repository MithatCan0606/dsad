const Discord = require("discord.js")
const dateformat = require("dateformat")

dateformat.i18n = {
    dayNames: [
        'Pzr', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmr',
        'Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'
    ],
    monthNames: [
        'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara',
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağsutos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ],
    timeNames: [
        'a', 'p', 'am', 'pm', 'A', 'P', 'AM', 'PM'
    ]
}

module.exports = {
    dateFormat: (date = Date, format = String) => {
        return dateformat(date, format)
    },
    promptMessage: async(message, author, time, validReactions) => {
        time *= 1000;
        for (const reaction of validReactions) await message.react(reaction)
        const filter = (reaction, user) => validReactions.includes(reaction.emoji.name) && user.id === author.id;
        return message
            .awaitReactions(filter, { max: 1, time: time})
            .then(collected => collected.first() && collected.first().emoji.name)
    },
    sendUsageEmbed: (message, text = String) => {
        message.channel.send(new Discord.MessageEmbed().setDescription(`**Hey ${message.member}, belirttiğin komutun kullanımı şu şekildedir;**\n\`\`\`${text}\`\`\``).setFooter(message.author.tag, message.author.avatarURL()).setTimestamp().setColor("BLACK"))
    },
    hasPerm: (member, requiredPerm) => {
        if(member.hasPermission("ADMINISTRATOR")) return true;
        if(requiredPerm == 0) return true;
        if(Number(requiredPerm) || typeof requiredPerm === "number") {
            if(!member.guild.roles.cache.has(requiredPerm)) return true;
            if(member.roles.cache.has(requiredPerm)) return true;
            return requiredPerm;
        } else {
            if(typeof requiredPerm === "string") {
                let perms = new Set([
                    "CREATE_INSTANT_INVITE",
                    "KICK_MEMBERS",
                    "BAN_MEMBERS",
                    "ADMINISTRATOR",
                    "MANAGE_CHANNELS",
                    "MANAGE_GUILD",
                    "ADD_REACTIONS",
                    "READ_MESSAGES",
                    "SEND_MESSAGES",
                    "SEND_TTS_MESSAGES",
                    "MANAGE_MESSAGES",
                    "EMBED_LINKS",
                    "ATTACH_FILES",
                    "READ_MESSAGE_HISTORY",
                    "MENTION_EVERYONE",
                    "EXTERNAL_EMOJIS",
                    "CONNECT",
                    "SPEAK",
                    "MUTE_MEMBERS",
                    "DEAFEN_MEMBERS",
                    "MOVE_MEMBERS",
                    "USE_VAD",
                    "CHANGE_NICKNAME",
                    "MANAGE_NICKNAMES",
                    "MANAGE_ROLES_OR_PERMISSIONS",
                    "MANAGE_WEBHOOKS",
                    "MANAGE_EMOJIS"
                ])
                if(!perms.has(requiredPerm.toUpperCase)) return true;
                if(member.hasPermission(requiredPerm.toUpperCase)) return true;
                return requiredPerm.toUpperCase;
            } else {
                return true;
            }
        }
    },
    noPermMsg: (message, type = String, requiredPerm = null) => {
        message.react("❌")
        if(type === "perm") {
            if(Number(requiredPerm) || typeof requiredPerm === "number") {
                return message.channel.send(new Discord.MessageEmbed().setDescription(`❌ Bu komutu kullanmak için \`${message.guild.roles.cache.get(requiredPerm).name}\` yetkisine sahip olmalısın, ${message.member}`).setAuthor(message.author.tag, message.author.avatarURL()).setTimestamp().setColor("RED")).then(m => m.delete({ timeout: 6000 }))
            } else {
                return message.channel.send(new Discord.MessageEmbed().setDescription(`❌ Bu komutu kullanmak için \`${requiredPerm}\` yetkisine sahip olmalısın, ${message.member}`).setAuthor(message.author.tag, message.author.avatarURL()).setTimestamp().setColor("RED")).then(m => m.delete({ timeout: 6000 }))
            }
        } else if(type === "author") {
            return message.channel.send(new Discord.MessageEmbed().setDescription(`❌ Bu komutu kullanmak için iznin yok, ${message.member}`).setAuthor(message.author.tag, message.author.avatarURL()).setTimestamp().setColor("RED")).then(m => m.delete({ timeout: 6000 }))
        }
        return;
    }
}