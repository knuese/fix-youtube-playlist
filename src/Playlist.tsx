import { type Component, For } from 'solid-js'
import { YouTubePlayer } from './YoutubePlayer.tsx'

interface PlaylistProps {
  videos: { title: string; id: string }[]
}

export const Playlist: Component<PlaylistProps> = (props) => {
  return (
    <div
      style={{
        display: 'grid',
        'grid-template-columns': '3fr 1fr',
        width: '100%',
        height: '100vh'
      }}
    >
      <YouTubePlayer id={props.videos[0].id} />
      <ul
        style={{
          'max-height': '100%',
          'overflow-y': 'auto',
          'list-style': 'none'
        }}
      >
        <For each={props.videos}>{(v) => <li>{v.title}</li>}</For>
      </ul>
    </div>
  )
}
