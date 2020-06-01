// @ts-nocheck
import { v4 } from "https://deno.land/std/uuid/mod.ts";
import { isWebSocketCloseEvent } from "https://deno.land/std/ws/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

const { MUX_ACCESS_TOKEN_ID, MUX_SECRET_KEY } = config();

const usersMap = new Map();

const streamsMap = new Map();

const messagesMap = new Map();

// This is called when user is connected
export default async function teach(ws, key, id) {
  // Generate unique userId
  const userId = v4.generate();

  const rtmpUrl = `rtmp://global-live.mux.com:5222/app/${key}`;

  const ffmpeg = Deno.run({
    cmd: [
      "/usr/local/bin/ffmpeg",
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
      //'-strict', 'experimental',
      "-bufsize",
      "1000",
      "-f",
      "flv",
      // allow run flag
      rtmpUrl,
    ],
    stdin: "piped",
    stdout: "piped",
    stderr: "piped",
  });

  console.log(rtmpUrl);
  console.log(ffmpeg);

  // Listening of WebSocket events
  for await (let data of ws) {
    const event = typeof data === "string" ? JSON.parse(data) : data;

    // If event is close,
    if (isWebSocketCloseEvent(data)) {
      // Take out user from usersMap
      leaveGroup(userId);
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
          ws,
        };
        console.log(userObj);
        console.log(event);
        // Put userObj inside usersMap
        usersMap.set(userId, userObj);

        // Take out users from streamsMap
        const users = streamsMap.get(event.groupName) || [];
        users.push(userObj);
        streamsMap.set(event.groupName, users);

        // Emit to all users in this group that new user joined.
        // emitUserList(event.groupName);
        // Emit all previous messages sent in this group to newly joined user
        break;
        // If it is message receive
      case "message":
        userObj = usersMap.get(userId);
        const message = {
          userId,
          name: userObj.name,
          message: event.data,
        };
        console.log(event);
        console.log("message received");
        console.log(event.data);
        const messages = messagesMap.get(userObj.groupName) || [];
        ///messages.push(message);
        console.log("this is some video data");
        ffmpeg.stdin.write(event.data);

        messagesMap.set(userObj.groupName, messages);
        //emitMessage(userObj.groupName, message, userId);
        break;
      default:
        console.log(event);
        ffmpeg.stdin.write(event);
    }
  }
}

function emitUserList(groupName) {
  // Get users from streamsMap
  const users = streamsMap.get(groupName) || [];
  // Iterate over users and send list of users to every user in the group
  for (const user of users) {
    const event = {
      event: "users",
      data: getDisplayUsers(groupName),
    };
    user.ws.send(JSON.stringify(event));
  }
}

function getDisplayUsers(groupName) {
  const users = streamsMap.get(groupName) || [];
  return users.map((u) => {
    return {
      userId: u.userId,
      name: u.name,
    };
  });
}
