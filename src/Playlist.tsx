import { type Component, For } from 'solid-js'

import styles from './Playlist.module.css'
import { YouTubePlayer } from './YoutubePlayer.tsx'

interface PlaylistProps {
  videos: { title: string; id: string }[]
}

export const Playlist: Component<PlaylistProps> = (props) => {
  return (
    <div class={styles.playlistContainer}>
      <YouTubePlayer id={props.videos[0].id} />
      <ul class={styles.playlistList}>
        <For each={props.videos}>{(v) => <li>{v.title}</li>}</For>
      </ul>
    </div>
  )
}
