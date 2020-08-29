module.exports = class Command {
    constructor(client, options, config) {
  
        this.client = client;
        this.guildPrefix = (guild) => (client.database.has(`guilds.${guild.id}.prefix`).value() ? client.database.get(`guilds.${guild.id}.prefix`).value() : client.prefix)
        this.cmdOptions = {
            name: options.name,
            aliases: options.aliases || "❌ Komutun herhangi bir kısayol kullanımı bulunamadı.",
            usage: options.usage || "❌ Komut kullanımı bulunamadı.",
            description: options.description || "❌ Komut açıklaması bulunamadı.",
            category: options.category || null
        }
        this.cmdConfig = {
            enabled: config.enabled || true,
            guildOnly: config.guildOnly || true,
            members: config.members ? new Set(config.members) : null,
            requiredPerm: config.requiredPerm || 0,
            cooldown: options.cooldown || 3
        }
        
    }
  
    async reload() {
        return new Promise((resolve, reject) => {
            try {
                delete require.cache[require.resolve(`../commands/${this.client.category_folders.get(this.cmdOptions.name)}/${this.cmdOptions.name}.js`)]
                let props = require(`../commands/${this.client.category_folders.get(this.cmdOptions.name)}/${this.cmdOptions.name}.js`)
                this.client.commands.delete(this.cmdOptions.name)
                this.client.aliases.forEach((props, alias) => {
                    this.client.aliases.delete(alias);
                })
                this.client.commands.set(command, props)
                if (props.cmdOptions.aliases && Array.isArray(props.cmdOptions.aliases)) {
                    if(props.cmdOptions.aliases.lenght > 0) props.cmdOptions.aliases.forEach(alias => this.client.aliases.set(alias, props.cmd_name))
                }
                if(typeof props.onLoad === "function") props.onLoad(this.client)
                resolve()
            } catch (e){
                reject(e)
            }
        })
    }
};