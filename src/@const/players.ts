import type { PlayerID } from "@types"

export const TEAM_META = {
    GSW: {},
    CLE: {},
    OKC: {},
    LAC: {}
}

//offSpeed is actually AVG Defense Speed
export const PLAYER_META = {
    2760: { fn: "Anderson", ln: "Varejao", offSpeed: 4.07, team: 'GSW', star: false },
    2738: { fn: "Andre", ln: "Iguodala", offSpeed: 3.78, team: 'GSW', star: false },
    101106: { fn: "Andrew", ln: "Bogut", offSpeed: 3.5, team: 'GSW', star: false },
    201575: { fn: "Brandon", ln: "Rush", offSpeed: 4.09, team: 'GSW', star: false },
    203110: { fn: "Draymond", ln: "Green", offSpeed: 3.49, team: 'GSW', star: 'defender' },
    203105: { fn: "Festus", ln: "Ezeli", offSpeed: 3.97, team: 'GSW', star: false },
    203084: { fn: "Harrison", ln: "Barnes", offSpeed: 4.02, team: 'GSW', star: false },
    203546: { fn: "Ian", ln: "Clark", offSpeed: 4.07, team: 'GSW', star: false },
    203949: { fn: "James Michael", ln: "McAdoo", offSpeed: 4.27, team: 'GSW', star: false },
    1626172: { fn: "Kevon", ln: "Looney", offSpeed: 4.05, team: 'GSW', star: false },
    202691: { fn: "Klay", ln: "Thompson", offSpeed: 3.85, team: 'GSW', star: 'shooter' },
    2571: { fn: "Leandro", ln: "Barbosa", offSpeed: 3.88, team: 'GSW', star: false },
    201578: { fn: "Marreese", ln: "Speights", offSpeed: 3.67, team: 'GSW', star: false },
    2733: { fn: "Shaun", ln: "Livingston", offSpeed: 3.85, team: 'GSW', star: false },
    201939: { fn: "Stephen", ln: "Curry", offSpeed: 3.68, team: 'GSW', star: 'shooter' },
    201574: { fn: "Jason", ln: "Thompson", offSpeed: 3.68, team: 'GSW', star: false },

    101112: { fn: "Channing", ln: "Frye", offSpeed: 3.61, team: 'CLE', star: false },
    2563: { fn: "Dahntay", ln: "Jones", offSpeed: 4.31, team: 'CLE', star: false },
    202697: { fn: "Iman", ln: "Shumpert", offSpeed: 4.08, team: 'CLE', star: false },
    2747: { fn: "JR", ln: "Smith", offSpeed: 3.92, team: 'CLE', star: false },
    2592: { fn: "James", ln: "Jones", offSpeed: 3.84, team: 'CLE', star: false },
    203099: { fn: "Jared", ln: "Cunningham", offSpeed: 4.24, team: 'CLE', star: false },
    203925: { fn: "Joe", ln: "Harris", offSpeed: 4.6, team: 'CLE', star: false },
    203895: { fn: "Jordan", ln: "McRae", offSpeed: 3.6, team: 'CLE', star: false },
    201567: { fn: "Kevin", ln: "Love", offSpeed: 3.86, team: 'CLE', star: false },
    202681: { fn: "Kyrie", ln: "Irving", offSpeed: 3.78, team: 'CLE', star: false },
    2544: { fn: "LeBron", ln: "James", offSpeed: 3.72, team: 'CLE', star: 'star' },
    203521: { fn: "Matthew", ln: "Dellavedova", offSpeed: 3.9, team: 'CLE', star: false },
    2590: { fn: "Mo", ln: "Williams", offSpeed: 3.92, team: 'CLE', star: false },
    2210: { fn: "Richard", ln: "Jefferson", offSpeed: 3.96, team: 'CLE', star: false },
    201619: { fn: "Sasha", ln: "Kaun", offSpeed: 4.12, team: 'CLE', star: false },
    202389: { fn: "Timofey", ln: "Mozgov", offSpeed: 4.12, team: 'CLE', star: false },
    202684: { fn: "Tristan", ln: "Thompson", offSpeed: 4.1, team: 'CLE', star: false },

    201566: { fn: 'Russell', ln: 'Westbrook', offSpeed: 3.71, team: 'OKC', star: 'shooter' },
    201627: { fn: 'Anthony', ln: 'Morrow', offSpeed: 3.80, team: 'OKC', star: false },
    203079: { fn: 'Dion', ln: 'Waiters', offSpeed: 3.74, team: 'OKC', star: false },
    2555: { fn: 'Nick', ln: 'Collison', offSpeed: 3.90, team: 'OKC', star: false },
    202713: { fn: 'Kyle', ln: 'Singler', offSpeed: 4.21, team: 'OKC', star: false },
    200779: { fn: 'Steve', ln: 'Novak', offSpeed: 3.87, team: 'OKC', star: false },
    201586: { fn: 'Serge', ln: 'Ibaka', offSpeed: 3.67, team: 'OKC', star: false },
    202683: { fn: 'Enes', ln: 'Kanter', offSpeed: 3.89, team: 'OKC', star: false },
    203500: { fn: 'Steven', ln: 'Adams', offSpeed: 3.79, team: 'OKC', star: false },
    201571: { fn: 'D.J.', ln: 'Augustin', offSpeed: 3.84, team: 'OKC', star: false },
    203460: { fn: 'Andre', ln: 'Roberson', offSpeed: 4.36, team: 'OKC', star: false },
    1626166: { fn: 'Cameron', ln: 'Payne', offSpeed: 4.11, team: 'OKC', star: false },
    201142: { fn: 'Kevin', ln: 'Durant', offSpeed: 3.47, team: 'OKC', star: 'shooter' },

    202362: { fn: 'Lance', ln: 'Stephenson', offSpeed: 3.98, team: 'LAC', star: false },
    101108: { fn: 'Chris', ln: 'Paul', offSpeed: 3.67, team: 'LAC', star: 'star' },
    200755: { fn: 'Redick', ln: 'JJ', offSpeed: 4.11, team: 'LAC', star: false },
    2746: { fn: 'Josh', ln: 'Smith', offSpeed: 3.72, team: 'LAC', star: false },
    201599: { fn: 'DeAndre', ln: 'Jordan', offSpeed: 3.68, team: 'LAC', star: false },
    203143: { fn: 'Pablo', ln: 'Prigioni', offSpeed: 4.46, team: 'LAC', star: false },
    2037: { fn: 'Jamal', ln: 'Crawford', offSpeed: 3.72, team: 'LAC', star: false },
    201601: { fn: 'Luc', ln: 'Mbah a Moute', offSpeed: 4.08, team: 'LAC', star: false },
    203085: { fn: 'Austin', ln: 'Rivers', offSpeed: 4.13, team: 'LAC', star: false },
    201933: { fn: 'Blake', ln: 'Griffin', offSpeed: 3.56, team: 'LAC', star: false },
    202325: { fn: 'Wesley', ln: 'Johnson', offSpeed: 4.06, team: 'LAC', star: false },
    1718: { fn: 'Paul', ln: 'Pierce', offSpeed: 3.54, team: 'LAC', star: false },
    202332: { fn: 'Cole', ln: 'Aldrich', offSpeed: 3.96, team: 'LAC', star: false },
} as const


export const PLAYER_RANDOM_FACTOR = Object.entries(PLAYER_META)
    .reduce((o, [pId, _]) => {
        o[+pId as PlayerID] = Math.random() * 0.6
        return o
    }, {} as Record<PlayerID, number>)