import ky from 'ky'
import { createResource, createSignal, Match, Switch } from 'solid-js'

import { Playlist } from './Playlist.tsx'

export const App = () => {
  const [playlistId, setPlaylistId] = createSignal<string | null>(null)

  const [videos] = createResource<{ title: string; id: string }[], string>(
    playlistId,
    (playlistId) => ky.get(`/api/playlist/${playlistId}`).json()
  )

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
        <Playlist videos={videos.latest!} />
      </Match>
    </Switch>
  )
}
