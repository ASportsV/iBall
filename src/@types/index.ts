import { PLAYER_META, TEAM_META, VIDEO_ID_GROUPS } from '@const'
import { BasePlayer, BaseVideo, Point } from 'common/@types'
import { DefensivePkg, OffensivePkg } from './gameData'

// export type VideoID = 'default'
export type PlayerID = keyof typeof PLAYER_META
export type Player = BasePlayer<PlayerID>

export type TeamID = keyof typeof TEAM_META
export type UnitID = 'unit0' | 'unit1' | 'unit2'
export type GameID = 'game1' | 'game2'

export type VideoID = typeof VIDEO_ID_GROUPS.game1_unit0[number] 
    | typeof VIDEO_ID_GROUPS.game1_unit1[number]
    | typeof VIDEO_ID_GROUPS.game1_unit2[number]
    | typeof VIDEO_ID_GROUPS.game2_unit0[number]
    | typeof VIDEO_ID_GROUPS.game2_unit1[number]
    | typeof VIDEO_ID_GROUPS.game2_unit2[number]
export type Video = BaseVideo<GameID, VideoID>


// augmenteation
declare module 'common/@types' {

    interface PlayerTrackingData {
        defending?: PlayerID
    }

    interface BasePlayer<PlayerID extends number> {
        readonly namePos: Point
        dataPkg?: OffensivePkg | DefensivePkg
    }

    interface Ball {
        readonly playerId?: PlayerID
    }

    interface Frame<PlayerID extends number> {
        teamWithBall?: TeamID
    }

    // interface Video<GameID, VideoID> {
    //   readonly gameId: GameID
    // }

}

export * from './gameData'