import { Client } from "discord.js";
import {
  joinVoiceChannel,
  createAudioPlayer,
  AudioPlayerStatus,
  createAudioResource,
  StreamType,
  entersState,
} from "@discordjs/voice";
import { soundFiles } from ".";

const doFunny = async (
  client: Client<boolean>,
  data: Map<string, string[]>
) => {
  console.log(data);

  for (const guild of data.keys()) {
    if (Math.floor(Math.random() * 1000) !== 69 && !process.env.DEV) continue;

    const channels = data.get(guild);
    if (!channels) continue;
    const target = await client.channels.fetch(
      channels[Math.floor(Math.random() * channels?.length)]
    );
    if (
      !target ||
      !target.isVoiceBased() ||
      !target.joinable ||
      target.id === target.guild.afkChannelId ||
      target.members.has(client.user?.id as string) ||
      !target.members.size
    )
      continue;

    const player = createAudioPlayer();
    player.play(
      createAudioResource(
        `./sounds/${soundFiles[Math.floor(Math.random() * soundFiles.length)]}`,
        {
          inputType: StreamType.Opus,
        }
      )
    );

    const connection = joinVoiceChannel({
      channelId: target.id,
      guildId: guild,
      adapterCreator: target.guild.voiceAdapterCreator,
    });

    const sub = connection.subscribe(player);

    if (sub) console.log("playing resource");
    await entersState(player, AudioPlayerStatus.Idle, 30_000);
    console.log("finished");

    connection.disconnect();
    connection.destroy();
  }
};

export default doFunny;