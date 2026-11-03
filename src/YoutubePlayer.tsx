import { createScriptLoader } from '@solid-primitives/script-loader'
import {
  type Component,
  createEffect,
  createSignal,
  onCleanup,
  onMount
} from 'solid-js'

interface YouTubePlayerProps {
  id: string
  onReady?: () => void
  onVideoEnd?: () => void
}

export const YouTubePlayer: Component<YouTubePlayerProps> = (props) => {
  /* eslint-disable no-unassigned-vars */
  let playerContainer!: HTMLDivElement
  /* eslint-enable */

  const [player, setPlayer] = createSignal<YT.Player | null>(null)

  createScriptLoader({ src: 'https://www.youtube.com/iframe_api' })

  onMount(() => {
    const videoId = props.id

    window.onYouTubeIframeAPIReady = () => {
      const ytPlayer = new window.YT.Player(playerContainer, {
        height: '360',
        width: '640',
        videoId,
        events: {
          onReady: (event: YT.PlayerEvent) => {
            event.target.playVideo()
            props.onReady?.()
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            if (event.data === YT.PlayerState.ENDED) {
              props.onVideoEnd?.()
            }
          }
        }
      })

      setPlayer(ytPlayer)
    }
  })

  onCleanup(() => {
    player()?.destroy()
  })

  createEffect(() => {
    if (player()) player()!.loadVideoById(props.id)
  })

  return <div ref={playerContainer!} />
}
