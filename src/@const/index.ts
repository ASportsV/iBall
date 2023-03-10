export * from './players'
export * from './gaze'
export * from './style'

// video players
export const VIDEO_ID_GROUPS = {
    game2_unit0: [],
    game1_unit0: [
        // '0_,',
        // '1_c,t',
        // '2_c,l',
        // '3_c,t',
        '4_,',
        '5_c,t',
        '6_,',
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
