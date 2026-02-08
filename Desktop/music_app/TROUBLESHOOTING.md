# Music App Not Playing?

If the music application is not playing audio, please check the following:

1.  **Browser Autoplay Policy**: Modern browsers block audio from playing automatically unless the user has interacted with the page first. Ensure you have clicked somewhere on the page before trying to play a song.
2.  **Network Issues**: The app streams directly from YouTube. If YouTube is blocked on your network or you have connection issues, playback will fail.
3.  **CORS / Ad Blockers**: Some aggressive ad blockers may strip out YouTube playback scripts. Try disabling extensions for localhost.
4.  **ReactPlayer Config**: The player uses `react-player/lazy` to load the YouTube player. If you see console errors, ensure `npm install` has been run correctly.

## Debugging

Open the browser console (F12) to see player logs:

- `Player Started` / `Player Playing`: The player is working.
- `Player Error`: There is an issue with the video ID or network.

## Known Issues

- Seek might fail if the video hasn't buffered enough.
- On mobile, volume control might be restricted by the OS.
- If you see `Unknown event handler property onDuration` and the sound doesn't play, the player might be falling back to a native `<video>` tag. This usually means the `react-player` import is incorrect or the URL is not recognized as a YouTube URL.
