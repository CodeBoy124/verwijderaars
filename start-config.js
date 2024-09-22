const tileTypes = {
    empty: 0,
    corps: 1,
    x: 2,
    l : 3,
    o: 4,
    '-': 5,
    '+': 6
}

function tileTypeToText(tileType) {
    switch(tileType) {
        case tileTypes.empty: return ' ';
        case tileTypes.corps: return '#';
        case tileTypes.x: return 'X';
        case tileTypes.l: return 'l';
        case tileTypes.o: return 'O';
        case tileTypes['-']: return '-';
        case tileTypes['+']: return '+';
    }
}

function tileTypeToCode(tileType) {
    switch(tileType) {
        case tileTypes.empty: return 'e';
        case tileTypes.corps: return 'c';
        case tileTypes.x: return 'x';
        case tileTypes.l: return 'l';
        case tileTypes.o: return 'o';
        case tileTypes['-']: return 'm';
        case tileTypes['+']: return 'p';
    }
}

let configurations = {
    default: [
        // player 1
        {
            pos: [0, 0],
            type: tileTypes.x,
            owner: 1
        },
        {
            pos: [1, 0],
            type: tileTypes.l,
            owner: 1
        },
        {
            pos: [2, 0],
            type: tileTypes.o,
            owner: 1
        },
        {
            pos: [3, 0],
            type: tileTypes.l,
            owner: 1
        },
        {
            pos: [4, 0],
            type: tileTypes.x,
            owner: 1
        },

        // player 2
        {
            pos: [0, 4],
            type: tileTypes.x,
            owner: 2
        },
        {
            pos: [1, 4],
            type: tileTypes.l,
            owner: 2
        },
        {
            pos: [2, 4],
            type: tileTypes.o,
            owner: 2
        },
        {
            pos: [3, 4],
            type: tileTypes.l,
            owner: 2
        },
        {
            pos: [4, 4],
            type: tileTypes.x,
            owner: 2
        },
    ],
    old: [
        // player 1
        {
            pos: [0, 0],
            type: tileTypes.x,
            owner: 1
        },
        {
            pos: [1, 0],
            type: tileTypes.l,
            owner: 1
        },
        {
            pos: [2, 0],
            type: tileTypes['-'],
            owner: 1
        },
        {
            pos: [3, 0],
            type: tileTypes.l,
            owner: 1
        },
        {
            pos: [4, 0],
            type: tileTypes.x,
            owner: 1
        },

        // player 2
        {
            pos: [0, 4],
            type: tileTypes.x,
            owner: 2
        },
        {
            pos: [1, 4],
            type: tileTypes.l,
            owner: 2
        },
        {
            pos: [2, 4],
            type: tileTypes['-'],
            owner: 2
        },
        {
            pos: [3, 4],
            type: tileTypes.l,
            owner: 2
        },
        {
            pos: [4, 4],
            type: tileTypes.x,
            owner: 2
        },
    ]
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const variant = urlParams.get('variant');

let chosenConfiguration
if(variant == null) {
    chosenConfiguration = configurations.default
} else if(variant in configurations) {
    chosenConfiguration = configurations[variant]
} else {
    chosenConfiguration = variant.split('-').map(action => {
        const [ownerStr, actionType, ...args] = action.split('')
        if(actionType == 'a') return null
        let [what, x, y] = args
        if(what == 'e') what = 'empty'
        if(what == 'c') what = 'corps'
        if(what == 'm') what = '-'
        if(what == 'p') what = '+'
        const owner = parseInt(ownerStr)
        return {
            pos: [x, y],
            type: tileTypes[what],
            owner: owner
        }
    }).filter(v => v != null)
}

const newStartConfiguration = chosenConfiguration