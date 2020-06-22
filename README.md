
### About the Server

This is an attempt at creating a Web API + Web Socket server in Deno while using ABC - [https://deno.land/x/abc@v1.0.0-rc2/mod.ts](https://deno.land/x/abc@v1.0.0-rc2/mod.ts). 

The `/live-stream` route helps in creating a live-stream, using the [MUX API](https://docs.mux.com/reference#live-streams) and returns back a Playback ID.
Further events from the [client](https://github.com/rishiraj824/chalk-it-out) are sent using websockets to the Deno socket port and pushed to the RTMP using an `ffmpeg` sub-process.

You can finally consume the stream using an HLS player on `http://stream.mux.com/:playback_id.m3u8`.

Read more about the project [here](https://github.com/rishiraj824/chalk-it-out/wiki).

### Run the server using:

`deno run --allow-write --allow-read --allow-net --allow-env --allow-run --unstable ./server.ts`

## Run the client:

[https://github.com/rishiraj824/chalk-it-out](https://github.com/rishiraj824/chalk-it-out)