import { createScriptLoader } from '@solid-primitives/script-loader'
import { type Component, onMount } from 'solid-js'

interface YouTubePlayerProps {
  id: string
}

export const YouTubePlayer: Component<YouTubePlayerProps> = (props) => {
  let playerContainer!: HTMLDivElement

  createScriptLoader({ src: 'https://www.youtube.com/iframe_api' })

  onMount(() => {
    const videoId = props.id

    window.onYouTubeIframeAPIReady = () => {
      new window.YT.Player(playerContainer, {
        height: '360',
        width: '640',
        videoId,
        events: {
          onReady: (event: YT.PlayerEvent) => {
            event.target.playVideo()
          }
        }
      })
    }
  })

  return <div ref={playerContainer!} />
}
