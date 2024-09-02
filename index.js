const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Events } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const hooksFilePath = path.join(__dirname, 'hooks.json');

try {
    const hooksData = fs.readFileSync(hooksFilePath, 'utf8');
    hooks = JSON.parse(hooksData);
    for (const hook of hooks) {
        if (hook.pattern) {
            hook.pattern = new RegExp(hook.pattern, 'i');
        }
    }
} catch (error) {
    console.error('Error loading hooks:', error);
}

client.once(Events.ClientReady, (readyClient) => {
    console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.MessageCreate, async (msg) => {
    for (const hook of hooks) {
        if (hook.guildId && msg.guildId !== hook.guildId) continue;
        if (hook.channelId && msg.channelId !== hook.channelId) continue;
        const match = msg.content.match(hook.pattern);
        if (match) {
            msg.channel.sendTyping();
            const response = await fetch(hook.webhook, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: match[1],
                }),
            });
            const json = await response.json();
            if (json.interactionResponse) {
                msg.reply(json.interactionResponse);
            } else {
                console.log('Did not get an interaction response from webhook: ', json);
            }
        }
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
