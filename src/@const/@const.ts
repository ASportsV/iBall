// if (process.env.NODE_ENV !== 'production') {
//     (global as any).$RefreshReg$ = () => { };
//     (global as any).$RefreshSig$ = () => () => { };
// }

export const VIDEO_ID_GROUPS = {
    game2_unit0: [],
    game1_unit0: [
        '0_,',
        '1_c,t',
        '2_c,l',
        '3_c,t',
    ],
    game1_unit1: [
        '4_,',
        '5_c,t',
        '6_,',
        '7_c,t',
        '8_c,',
        '9_c,t',
        '10_,',
        '11_c,t',
        '12_,',
        '13_c,t',
        '14_c,',
        '15_c,t',
    ],
    game1_unit2: [
        '16_,',
        '17_c,t',
        '18_,l',
        '19_c,t',
        '20_,',
        '21_c,t',
        '22_,',
        '23_c,t',
        '24_,l',
        '25_c,t',
        '26_,l',
        '27_,l',
        '28_,l',
        '30_,'
    ],
    game2_unit1: [
        '0_,',
        '1_c,t',
        '2_,t',
        '3_c,',
        '4_c,t',
        '5_c,',
        '6_c,t',
        '7_c,l',
        '8_c,t',
        '9_c,',
        '10_c,t'
    ],
    game2_unit2: [
        '11_,t',
        '12_c,l',
        '13_c,',
        '14_c,t',
        '15_c,',
        '16_c,t',
        '17_,l',
        '18_c,t',
        '19_,t',
        '20_c,',
        '21_c,t',
        '22_c,l',
        '23_c,t',
        '24_,l',
        '25_c,t',
        '26_,',
        '27_c,t',
        '28_,',
        '29_c,t',
        '30_,t',
        '31_c,',
        '32_c,t',
        '33_,t',
        '34_c,',
        '35_c,t',
    ]
} as const

export const miniMapSize: [number, number] = [720, 720 * 50 / 94]

// export const FULL = false

export const COLORS = {
    offense_inner_border: '#f5f5f5',
    offense_bg_fill: '#f5f5f577',
    offense_outer_border: 'rgba(220, 220, 220, 0.1)',
    defense_bg_fill: `rgba(255, 255, 255, 0.15)`,
    defense_fg_fill: `#f5f5f5`,
    player_name: '#f5f5f5',
    BG_MASK_ALPHA: 0.3,
    FG_MASK_ALPHA: 0.2,
    off_df_link: '255, 255, 255',
    star_name: 'rgb(255, 243, 194)',
    star_star: 'rgb(255, 243, 194)', // 'rgb(255,215,120)'
} as const