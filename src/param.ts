import { VIDEO_ID_GROUPS } from "@const"
import { UnitID, GameID } from "@types"

export class Parameters {

    // get VIDEO_FRAME_RATE() {
    //     return this.GAME_ID === 'game1' ? 29.97 : 29.81
    // }

    get VIDEO_IDS() {
        return VIDEO_ID_GROUPS[`${this.GAME_ID}_${this.UNIT_ID}`]
    }

    constructor(
        public readonly GAME_ID: GameID = 'game1',
        public readonly UNIT_ID: UnitID = 'unit0',
        public readonly MODE: 'AUG' | 'FULL' | 'RAW' = 'FULL',
        public readonly LV_FOCUS: boolean = MODE === 'FULL',
        public readonly LV_INTRE: boolean = MODE === 'FULL'
    ) {
        console.log(global.location.search)
        console.debug(`%cParams:
    GAME_ID: ${GAME_ID},
    UNIT_ID: ${UNIT_ID},
    MODE: ${MODE},
    LV_FOCUS: ${LV_FOCUS},
    LV_INTRE: ${LV_INTRE}
`, 'background: #444; color: #bada55; padding: 2px; border-radius:2px')
    }
}

function initParams() {
    const params = new URLSearchParams(global.location.search);
    let gameId: GameID = 'game1'
    if(params.get('g') !== null) {
        gameId = `game${params.get('g')}` as GameID
    }
    // validate
    if(!['game1', 'game2'].includes(gameId)) {
        alert('GameId must be game1 or game2')
    }

    let unitId: UnitID = 'unit0'
    if(params.get('u') !== null) {
        unitId = `unit${params.get('u')}` as UnitID
    }
    if(!['unit0', 'unit1', 'unit2'].includes(unitId)) {
        alert('UnitId must be unit0, unit1, or unit2')
    }

    let mode: 'AUG' | 'FULL' | 'RAW' = 'AUG'
    if(params.get('m') !== null) {
        mode =  params.get('m')!.toUpperCase() as 'AUG' | 'FULL' | 'RAW'
    }
    if(!['AUG', 'FULL', 'RAW'].includes(mode)) {
        alert('Mode must be RAW, AUG, or FULL')
    }

    let lvFocus: boolean = mode === 'FULL'
    if(params.get('gf') !== null) {
        lvFocus = params.get('gf') === 'true'
    }
    
    let lvInt = mode === 'FULL'
    if(params.get('gi') !== null) {
        lvInt = params.get('gi') === 'true'
    }

    return new Parameters(gameId, unitId, mode, lvFocus, lvInt)
}

export const params = initParams()