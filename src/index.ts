import "dotenv/config";
import {
  ActivityType,
  Client,
  GatewayIntentBits,
  Guild,
  OAuth2Guild,
} from "discord.js";
import { generateDependencyReport } from "@discordjs/voice";
import { readdirSync } from "fs";
import funny from "./join";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

console.log(generateDependencyReport());

const data: Map<string, string[]> = new Map();

export const soundFiles = readdirSync("./sounds");

client.on("ready", async () => {
  console.log(
    `${client.user?.username} ready\n ${soundFiles.length} sound files loaded`
  );

  await updateGuilds((await client.guilds.fetch()).map((g) => g));
  console.log(`Found ${data.size} guilds with voice channels`);

  client.user?.setActivity("funny challenge", { type: ActivityType.Competing });
});

client.on("guildCreate", async (guild) => {
  console.log("Guild created");
  await updateGuilds([guild]);
});
client.on("guildDelete", async (guild) => {
  console.log("Guild deleted");
  data.delete(guild.id);
});
client.on("channelCreate", async (channel) => {
  if (!channel.isVoiceBased()) return;
  console.log("Voice channel created");

  const channels = data.get(channel.guild.id);
  if (channels) data.set(channel.guild.id, [...channels, channel.id]);
  else await updateGuilds([channel.guild]);
});
client.on("channelDelete", async (channel) => {
  if (!channel.isVoiceBased()) return;
  console.log("Voice channel deleted");

  const channels = data.get(channel.guild.id);
  if (channels)
    data.set(
      channel.guild.id,
      channels.filter((c) => c !== channel.id)
    );
  else await updateGuilds([channel.guild]);
});

setInterval(() => funny(client, data), process.env.DEV ? 3000 : 800000);

const updateGuilds = async (guilds: OAuth2Guild[] | Guild[]) => {
  for (const guild of guilds)
    data.set(
      guild.id,
      (await (await guild.fetch()).channels.fetch())
        .filter((c) => c.isVoiceBased() && c.joinable)
        .map((c) => c.id)
    );
};

void client.login(process.env.TOKEN);
