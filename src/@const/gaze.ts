export const GAZE_R = 20

// lnSync threshold in ms, if you are not watching all the key players at least EXPLORE_MODE_THRESHOLD ms, the system will show you the next highlight
export const NEXT_BALL_HOLDER_TIME_RANGE = 1.8
export const LV_INTEREST_THRESHOLD = { off: 0.03, on: 0.6 }
// // for lvSync
// export const EXPLORE_MODE_THRESHOLD = 1500 // ms
// // the highlight triggered by lvSync will exist for EXPLORE_STAY_THRESHOLD ms
export const EXPLORE_STAY_THRESHOLD = 1500
// the min distance for an empty player, which means that if the distance between an offensor
// and his closet defender is larger than EMPTY_SPACE_THRESHOLD, the system will think the offensor is an empty player
export const EMPTY_SPACE_THRESHOLD = 8
export const MAX_HIGHLIGHTED = 4 //{ S1: 2, S2: 3 }[LV_SYNC]
export const FOCUS = { min: 10, max: 630, mina: 0.2, maxa: 0.35 }