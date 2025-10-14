import ky from 'ky'
import { createResource, createSignal, Match, onMount, Switch } from 'solid-js'

import { Playlist } from './Playlist.tsx'
import type { Video } from './types.ts'

export const App = () => {
  const [playlistId, setPlaylistId] = createSignal<string | null>(null)

  const [videos, { refetch }] = createResource<Video[], string>(
    playlistId,
    async (playlistId) => {
      let data: Video[]

      const cached = localStorage.getItem(playlistId)

      if (cached) {
        data = JSON.parse(cached)
      } else {
        data = await ky
          .get(`/api/playlist/${playlistId}`, { timeout: 20000 })
          .json()
        localStorage.setItem(playlistId, JSON.stringify(data))
      }

      return data
    }
  )

  onMount(() => {
    const search = new URLSearchParams(window.location.search)
    const pl = search.get('pl')

    if (pl) {
      setPlaylistId(pl)
    }
  })

  return (
    <Switch>
      <Match when={!playlistId()}>
        <label style={{ display: 'flex', gap: '8px' }}>
          Enter Playlist ID:
          <input
            style={{ width: '250px' }}
            onChange={(e) => setPlaylistId(e.currentTarget.value)}
          />
        </label>
      </Match>
      <Match when={videos.loading}>Loading...</Match>
      <Match when={videos.error}>Error: {videos.error}</Match>
      <Match when={videos.latest}>
        <Playlist
          id={playlistId()!}
          refetch={refetch}
          videos={videos.latest!}
        />
      </Match>
    </Switch>
  )
}
