/** Ensures only one <video>/<audio> element plays at a time, app-wide.
 * Media "play" events don't bubble, so this listens during the capture
 * phase on document — that's the only way to catch it from a single
 * top-level listener instead of wiring every player individually. */
export function initSingleMediaPlayback() {
  document.addEventListener(
    'play',
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLMediaElement)) return;

      document.querySelectorAll('video, audio').forEach((el) => {
        if (el !== target && el instanceof HTMLMediaElement && !el.paused) {
          el.pause();
        }
      });
    },
    true
  );
}
