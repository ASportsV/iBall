
import type { GameID, PlayerID, VideoID } from '@types';

import { loadFramesFromDBToMem, Database } from 'common/DataLoader'
import { postProcessing, IBallTables, loadBins } from './loadData'

declare const self: DedicatedWorkerGlobalScope;
export default {} as typeof Worker & { new(): Worker };

const db = new Database<PlayerID, IBallTables>({
  playerBins: "[playerId]",
  defenseRecords: "[PLAYER_ID+DEFENSE_CATEGORY]"
})

onmessage = async (e) => {

  switch (e.data[0]) {
    case 'Frames':
      let frames = await loadFramesFromDBToMem<GameID, VideoID, PlayerID>(e.data[1], db)
      if (frames) {
        frames = await postProcessing(e.data[1], frames, db)
      }
      postMessage(['Frames', frames])
      break
    case 'Bins':
      const playerBins = await loadBins(db)
      postMessage(['Bins', playerBins])
  }
}
