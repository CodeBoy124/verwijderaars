let tiles = []

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

function clickTile(x, y) {
    showAddPossibilities(Object.values(tileTypes), (type) => {
        tiles[y][x].owner = (type == tileTypes.corps || type == tileTypes.empty) ? 0 : 2
        tiles[y][x].type = type
        tiles[y][x].element.style.color = 'blue'
        if(type == tileTypes.corps) {
            if(type == tileTypes.corps) tiles[y][x].element.style.opacity = 0.3
            add(tiles[y][x].element, CrossedTile)
        } else tiles[y][x].element.innerText = tileTypeToText(type)

        const fY = 4-y
        const fX = 4-x
        tiles[fY][fX].owner = (type == tileTypes.corps || type == tileTypes.empty) ? 0 : 1
        tiles[fY][fX].type = type
        tiles[fY][fX].element.style.color = 'red'
        if(type == tileTypes.corps) {
            if(type == tileTypes.corps) tiles[fY][fX].element.style.opacity = 0.3
            add(tiles[fY][fX].element, CrossedTile)
        } else tiles[fY][fX].element.innerText = tileTypeToText(type)
    })
}

const styles = {
    tile: {
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '50px',
        height: '50px',
        backgroundColor: 'white',
        border: '1px solid black',
        fontWeight: 'bold',
        fontSize: 'x-large',
        cursor: 'default',

        '-webkit-user-select': 'none',
        '-moz-user-select': 'none',
        '-ms-user-select': 'none',
        userSelect: 'non'
    },
    row: {
        display: 'flex'
    },
    highlight: {
        position: 'absolute',
        left: '0',
        top: '0',
        width: '100%',
        height: '100%',
        opacity: '0.3'
    },
    possibilities: {
        position: 'fixed',
        left: '50%',
        bottom: '25px',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '10px',
        borderRadius: '5px',
        display: 'flex',
        gap: '5px',
        color: 'white'
    },
    btn: {
        minWidth: '40px',
        minHeight: '40px',
        padding: '5px',
        fontSize: 'large',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    score: {
        color: 'white',
        fontSize: 'x-large',
        fontWeight: 'bold',
    },
    corner: {
        topLeft: {borderRadius: '15px 0 0 0'},
        topRight: {borderRadius: '0 15px 0 0'},
        bottomRight: {borderRadius: '0 0 15px 0'},
        bottomLeft: {borderRadius: '0 0 0 15px'},
    }
}

function Tile() {
    const tileX = tiles[tiles.length-1].length
    const tileY = tiles.length-1

    const tileEl = e.div({
        style: styles.tile,
        $click: () => clickTile(tileX, tileY)
    })

    tiles[tiles.length-1].push({
        element: tileEl,
        owner: 0,
        type: tileTypes.empty
    })

    return tileEl
}

function TileRow(size = 5) {
    tiles.push([])

    return e.div({style: styles.row}, () => {
        for(let i = 0; i < size; i++) {
            Tile()
        }
    })
}

function TileGrid(width = 5, height = 5) {
    return e.div({
        style: {clipPath: 'inset(0 0 round 15px)'}
    }, () => {
        for(let i = 0; i < height; i++) {
            TileRow(width)
        }
    })
}

function getTilesAsReplay() {
    const replay = []
    for(let y in tiles) {
        for(let x in tiles[y]) {
            const tile = tiles[y][x]
            if(tile.type == tileTypes.empty) continue
            replay.push({
                x: parseInt(x),
                y: parseInt(y),
                type: tileTypeToCode(tile.type),
                owner: tile.owner
            })
        }
    }

    return replay.map(item => `${item.owner}p${item.type}${item.x}${item.y}`).join('-')
}

function CustomSetupApp() {
    const goPlay = () => {
        window.location.href = `play.html?variant=${getTilesAsReplay()}`
    }

    return e.div({
        style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
        }
    }, () => {
        e.button({style: styles.btn, $click: goPlay}, () => v('Play'))
        TileGrid()
    })
}

add(document.body, CustomSetupApp)

function CrossedTile() {
    return e.img({
        src: './crossed.png',
        style: {
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
        }
    })
}

function AddPossibilities(options, callback) {
    let root
    const removeThis = () => root.remove()

    root = e.div({style: styles.possibilities, class: 'possibilities'}, () => {
        for(let option of options.sort()) {
            e.button({
                style: styles.btn,
                $click: () => {
                    callback(option),
                    removeThis()
                }
            }, () => v(tileTypeToText(option)))
        }
    })

    return root
}

function closeAddPossibilities() {
    document.querySelectorAll('.possibilities').forEach(el => el.remove())
}

function showAddPossibilities(options, callback) {
    closeAddPossibilities()
    add(document.body, () => AddPossibilities(options, callback))
}