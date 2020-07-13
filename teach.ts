// @ts-nocheck
import { v4 } from "https://deno.land/std/uuid/mod.ts";
import { isWebSocketCloseEvent } from "https://deno.land/std/ws/mod.ts";

const usersMap = new Map();

const streamsMap = new Map();

const messagesMap = new Map();

// This is called when user is connected
export default async function teach(ws, key, id) {
  // Generate unique userId
  const userId = v4.generate();

  //createProcess(key);
  const rtmpUrl = `rtmps://global-live.mux.com/app/${key}`;
  //ffmpeg -re -i ../sample-mp4-file.mp4 -acodec copy -vcodec copy -b:v 2000k -r 30 -f flv rtmp://global-live.mux.com:5222/app/31f8248e-b1d1-6b0c-10d8-c071c13e5e3c
  const ffmpeg = Deno.run({
    cmd: [
      "ffmpeg",
      "-i",
      "-",

      // video codec config: low latency, adaptive bitrate
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-tune",
      "zerolatency",

      // audio codec config: sampling frequency (11025, 22050, 44100), bitrate 64 kbits
      "-c:a",
      "aac",
      "-ar",
      "44100",
      "-b:a",
      "64k",

      //force to overwrite
      "-y",

      // used for audio sync
      "-use_wallclock_as_timestamps",
      "1",
      "-async",
      "1",

      //'-filter_complex', 'aresample=44100', // resample audio to 44100Hz, needed if input is not 44100
      "-strict",
      "experimental",
      "-bufsize",
      "1000",
      "-f",
      "flv",
      rtmpUrl,
    ],
    stdin: "piped",
    stdout: "piped",
    stderr: "piped",
  });

  // Listening of WebSocket events
  for await (let data of ws) {
    const event = typeof data === "string" ? JSON.parse(data) : data;
    
    // If event is close,
    if (isWebSocketCloseEvent(data)) {
      // Take out user from usersMap
      break;
    }

    let userObj;
    // Check received data.event
    switch (event.event) {
      // If it is join
      case "join":
        // Create userObj with ws, groupName and name
        userObj = {
          userId,
          name: event.name,
          groupName: event.groupName,
        };
        usersMap.set(userId, userObj);

        const users = streamsMap.get(event.groupName) || [];
        users.push(userObj);
        streamsMap.set(event.groupName, users);
        console.log("connection established");
        break;
      case "close":
        ffmpeg.stdin.close();
        const { code } = await ffmpeg.status();
        console.log(`\n${code}\n`);

        if (code === 0) {
          const rawOutput = await ffmpeg.output();
          await Deno.stdout.write(rawOutput);
        } else {
          const rawError = await ffmpeg.stderrOutput();
          const errorString = new TextDecoder().decode(rawError);
          console.log(errorString);
        }
      default:
        //userObj = usersMap.get(userId);
        /* const message = {
          userId,
          name: userObj.name,
          message: event,
        }; */
        //const messages = messagesMap.get(userObj.groupName) || [];
        //messages.push(message);
        /* 
        console.log(ffmpegProcess);
        console.log(ffmpegErr); */
        if (event instanceof Uint8Array) {
          console.log(event);
          console.log(rtmpUrl)
          await ffmpeg.stdin.write(event);
          
          
        }
        //messagesMap.set(userObj.groupName, messages);
        break;
    }
  }
}
