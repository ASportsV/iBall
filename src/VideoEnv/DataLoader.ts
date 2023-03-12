import { GameID, PlayerID, PlayerShotBin, VideoID } from '@types';
import { wrapWorker } from 'common/@utils';
import { DataLoader } from 'common/DataLoader';
import IBallWorker from './loadData.worker'

export class IBallDataLoader extends DataLoader<GameID, VideoID, PlayerID> {

    #getBins: () => Promise<Partial<Record<PlayerID, PlayerShotBin[]>>>

    constructor() {
        super(IBallWorker)
        this.#getBins = wrapWorker<[], Partial<Record<PlayerID, PlayerShotBin[]>>>(this.worker, 'Bins')
    }

    /**
     * -------------- Game data ----------------
     */
    playerBins: Partial<Record<PlayerID, PlayerShotBin[]>> = {}
    async loadBins() {
        this.playerBins = await this.#getBins();
    }
}