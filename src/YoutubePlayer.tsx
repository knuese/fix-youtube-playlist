import { type Component, onMount } from 'solid-js'
import { createScriptLoader } from '@solid-primitives/script-loader'

interface YouTubePlayerProps {
  id: string
}

export const YouTubePlayer: Component<YouTubePlayerProps> = (props) => {
  let playerContainer!: HTMLDivElement

  createScriptLoader({ src: 'https://www.youtube.com/iframe_api' })

  onMount(() => {
    window.onYouTubeIframeAPIReady = () => {
      new window.YT.Player(playerContainer, {
        height: '360',
        width: '640',
        videoId: props.id,
        events: {
          onReady: (event: any) => {
            event.target.playVideo()
          }
        }
      })
    }
  })

  return <div ref={playerContainer!} />
}
