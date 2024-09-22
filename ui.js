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

let scoreEls = {
    1: null,
    2: null
}

let isRotated = false
function RotateScreenButton(callback) {
    return e.button({
        style: {
            ...styles.btn,
            position: 'fixed',
            top: '10px',
            right: '10px'
        },
        $click: () => callback()
    }, () => v('R'))
}

let history = {
    moves: newStartConfiguration.map(item => `${item.owner}p${tileTypeToCode(item.type)}${item.pos[0]}${item.pos[1]}`),
    subscribers: [],
    push(...newMoves) {
        this.moves.push(...newMoves)
        this.subscribers.forEach(subscriber => subscriber(this.moves))
    },
    sub(callback) {
        this.subscribers.push(callback)
    }
}

function HistoryChat() {
    const render = () => {
        let moves = history.moves
        for(let i = 0; i < moves.length; i++) {
            const move = moves[i]
            e.p(() => v(move))
            if(i+1 < moves.length) {
                e.span(() => v('-'))
            }
        }
    }

    const copyIt = () => {
        const copyEl = document.createElement('input')
        copyEl.value = history.moves.join('-')
        copyEl.select()
        copyEl.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(copyEl.value);
        alert('Copied')
    }

    let container = e.div({
        style: {
            position: 'absolute',
            top: '10px',
            left: '10px',
            width: 'calc(100vw - 20px)',
            '-webkit-mask-image': 'linear-gradient(to right, #000, rgba(0,0,0,0))',
            overflow: 'hidden',
            color: 'white',
            opacity: 0.3,
            display: 'flex',
            gap: '5px',
            cursor: 'pointer'
        },
        $click: copyIt
    }, render)

    history.sub(() => {
        container.replaceChildren()
        add(container, render)
    })

    return container
}

function VerwijderaarsApp() {
    let container;

    const rotateScreen = () => {
        isRotated = !isRotated
        if(isRotated) {
            container.style.transform = 'rotate(90deg)'
        } else {
            container.style.transform = 'rotate(0deg)'
        }
    }

    onMount(() => {
        loadTiles(newStartConfiguration)

        add(document.body, () => RotateScreenButton(rotateScreen))
    })

    add(document.body, HistoryChat)

    container = e.div({
        style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            transition: 'transform 1.5s'
        }
    }, () => {
        scoreEls[1] = e.p({style: styles.score}, () => v('5'))
        TileGrid()
        scoreEls[2] = e.p({style: styles.score}, () => v('5'))
    })
}

add(document.body, VerwijderaarsApp)

function HighlightPlace() {
    return e.div({style: {...styles.highlight, backgroundColor: 'green'}, class: 'highlight'})
}

function HighlightHit() {
    return e.div({style: {...styles.highlight, backgroundColor: 'red'}, class: 'highlight'})
}

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