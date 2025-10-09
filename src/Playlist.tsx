import {
  type Component,
  createEffect,
  createSignal,
  For,
  onMount,
  Show
} from 'solid-js'

import styles from './Playlist.module.css'
import { YouTubePlayer } from './YoutubePlayer.tsx'

interface PlaylistProps {
  videos: { title: string; id: string }[]
}

export const Playlist: Component<PlaylistProps> = (props) => {
  const [currentVideo, setCurrentVideo] = createSignal('')
  const [seenVideos, setSeenVideos] = createSignal<Set<string>>(new Set())

  const getRandomVideo = () => {
    const unseenVideos = props.videos.filter((v) => !seenVideos().has(v.id))

    if (unseenVideos.length < 1) {
      alert('no videos left')
      return
    }

    const index = Math.floor(Math.random() * unseenVideos.length) + 1
    const nextVideo = unseenVideos[index].id

    setSeenVideos((prev) => prev.add(nextVideo))
    setCurrentVideo(nextVideo)
  }

  const scrollSelected = () => {
    const selected = document.querySelector(`.${styles.selected}`)
    console.log(currentVideo(), selected)
    selected?.scrollIntoView({ block: 'center' })
  }

  onMount(() => {
    getRandomVideo()
  })

  createEffect(() => {
    if (currentVideo()) {
      scrollSelected()
    }
  })

  return (
    <div class={styles.playlistContainer}>
      <Show when={currentVideo()}>
        <YouTubePlayer id={currentVideo()} onReady={scrollSelected} />
      </Show>
      <ul class={styles.playlistList}>
        <For each={props.videos}>
          {(v) => (
            <li
              classList={{ [styles.selected]: v.id === currentVideo() }}
              onClick={() => {
                setCurrentVideo(v.id)
                setSeenVideos((prev) => prev.add(v.id))
              }}
            >
              {v.title}
            </li>
          )}
        </For>
      </ul>
    </div>
  )
}
