import {
  type Component,
  createEffect,
  createSignal,
  For,
  onMount,
  Show
} from 'solid-js'

import styles from './Playlist.module.css'

interface Video {
  title: string
  id: string
}

interface PlaylistProps {
  videos: { title: string; id: string }[]
}

export const Playlist: Component<PlaylistProps> = (props) => {
  const [currentVideo, setCurrentVideo] = createSignal<Video>()
  const [seenVideos, setSeenVideos] = createSignal<Set<string>>(new Set())

  const getRandomVideo = () => {
    const unseenVideos = props.videos.filter((v) => !seenVideos().has(v.id))

    if (unseenVideos.length < 1) {
      alert('no videos left')
      return
    }

    const index = Math.floor(Math.random() * unseenVideos.length) + 1
    const nextVideo = unseenVideos[index]

    setSeenVideos((prev) => prev.add(nextVideo.id))
    setCurrentVideo(nextVideo)
  }

  const scrollSelected = () => {
    const selected = document.querySelector(`.${styles.selected}`)
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
      <div class={styles.currentVideo}>
        <Show when={currentVideo()}>
          <p>
            Now playing: <b>{currentVideo()!.title}</b>
          </p>
        </Show>
        <button onClick={getRandomVideo}>Pick New Video</button>
      </div>
      <ul class={styles.playlistList}>
        <For each={props.videos}>
          {(v) => (
            <li
              classList={{ [styles.selected]: v.id === currentVideo()?.id }}
              onClick={() => {
                setCurrentVideo(v)
                setSeenVideos((prev) => prev.add(v.id))
              }}
            >
              <div>{v.title}</div>
              <div data-testid="video-id">{v.id}</div>
            </li>
          )}
        </For>
      </ul>
    </div>
  )
}
