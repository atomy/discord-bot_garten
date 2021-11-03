const Discord = require('discord.js')
const client = new Discord.Client()
var util = require('util')
const NATS = require('nats')

require('console-stamp')(console, 'HH:MM:ss.l');
var lastUpdate = 0

if (!process.env.DISCORD_API_KEY || process.env.DISCORD_API_KEY.length <= 0) {
    console.log('ERROR: Env variable DISCORD_API_KEY does not exists or is empty!')
    process.exit(1)
}

if (!process.env.NATS_IP || process.env.NATS_IP.length <= 0) {
    console.log('ERROR: Env variable NATS_IP does not exists or is empty!')
    process.exit(1)
}

if (!process.env.NATS_PORT || process.env.NATS_PORT.length <= 0) {
    console.log('ERROR: Env variable NATS_PORT does not exists or is empty!')
    process.exit(1)
}

const discordApiKey = process.env.DISCORD_API_KEY
const natsIp = process.env.NATS_IP
const natsPort = process.env.NATS_PORT

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
    setupNatsConnection()
    setupDeadChecker()
});

setupNatsConnection = () => {
    let natsAddress = util.format("nats://%s:%d", natsIp, natsPort);

    console.log('Connecting to nats-backend: ' + natsAddress);
    const nc = NATS.connect(natsAddress);
    console.log('Connected!');

    nc.subscribe('garden', (msg, reply, subject, sid) => {
        console.log('Received message: ' + msg)
        const message = JSON.parse(msg)
        const currentUnixTimestamp = Math.floor(+new Date() / 1000);

        if (message.type === "sensor") {
            // only update every 60s
            if (currentUnixTimestamp - lastUpdate > 60) {
                lastUpdate = currentUnixTimestamp;
                let presenceMessage = util.format('T: %s - H: %s', message.temperature, message.humidity);
                console.log('Setting activity: ' + presenceMessage);
                client.user.setActivity(presenceMessage, {type: 'WATCHING'});
            }
        }
    })
}

console.log("Connecting and login in...");
client.login(discordApiKey);

// check for dead queue
const setupDeadChecker = function() {
    console.log("[Dead-Queue-Check] Checking for dead queue...");
    const currentUnixTimestamp = Math.floor(+new Date() / 1000);
    console.log("[Dead-Queue-Check] Last update from queue was '" + (currentUnixTimestamp - lastUpdate) + "' seconds ago");

    if ((currentUnixTimestamp - lastUpdate) > 300) {
        console.log("[Dead-Queue-Check] Dead Queue detected!");
        let presenceMessage = "?";
        console.log('Setting activity: ' + presenceMessage);
        client.user.setActivity(presenceMessage, {type: 'WATCHING'});
    } else {
        console.log("[Dead-Queue-Check] Queue seems to be alive!");
    }

    setTimeout(setupDeadChecker, 300000);
};