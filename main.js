let tiles = []
let activePlayer = Math.random() > 0.5 ? 2 : 1

if(activePlayer == 1) {
    document.body.style.backgroundColor = 'rgb(50, 0, 0)'
} else {
    document.body.style.backgroundColor = 'rgb(0, 0, 50)'
}

let scores = {
    1: newStartConfiguration.filter(v => v.owner == 1).length,
    2: newStartConfiguration.filter(v => v.owner == 2).length
}

function getTile(x, y) {
    if(y < 0 || y >= tiles.length) return null
    if(x < 0 || x >= tiles[y].length) return null
    return tiles[y][x]
}

function refreshHighlights() {
    let canDoSomething = false

    for(let highlightElement of document.querySelectorAll('.highlight')) {
        highlightElement.remove()
    }

    // Attack
    for(let y in tiles) {
        for(let x in tiles[y]) {
            const tile = tiles[y][x]
            if(tile.owner != activePlayer && tile.type != tileTypes.corps && tile.type != tileTypes.empty) {
                if(canAttack(parseInt(x), parseInt(y))) {
                    add(tile.element, HighlightHit)
                    canDoSomething = true
                }
            }
        }
    }

    // Place
    let placeables = []
    for(let y in tiles) {
        for(let x in tiles[y]) {
            const tile = tiles[y][x]
            if(tile.type == tileTypes.empty || tile.type == tileTypes.corps || tile.owner != activePlayer) continue
            
            // check above
            if(getTile(x, parseInt(y)+1)?.type == tileTypes.empty) {
                if(!placeables.includes(`${x},${parseInt(y)+1}`)) placeables.push(`${x},${parseInt(y)+1}`)
            }
            if(getTile(x, parseInt(y)-1)?.type == tileTypes.empty) {
                if(!placeables.includes(`${x},${parseInt(y)-1}`)) placeables.push(`${x},${parseInt(y)-1}`)
            }
            if(getTile(parseInt(x)+1, y)?.type == tileTypes.empty) {
                if(!placeables.includes(`${parseInt(x)+1},${y}`)) placeables.push(`${parseInt(x)+1},${y}`)
            }
            if(getTile(parseInt(x)-1, y)?.type == tileTypes.empty) {
                if(!placeables.includes(`${parseInt(x)-1},${y}`)) placeables.push(`${parseInt(x)-1},${y}`)
            }
        }
    }
    for(let placeable of placeables) {
        const [x, y] = placeable.split(',').map(v => parseInt(v))
        const tile = getTile(x, y)
        if(tile == null) continue
        add(tile.element, HighlightPlace)
        canDoSomething = true
    }

    return canDoSomething
}

function loadTiles(points) {
    for(let point of points) {
        const [x, y] = point.pos
        tiles[y][x].owner = point.owner
        if(point.owner == 0) tiles[y][x].element.style.color = 'black'
        if(point.owner == 1) tiles[y][x].element.style.color = 'red'
        if(point.owner == 2) tiles[y][x].element.style.color = 'blue'
        tiles[y][x].type = point.type
        if(point.type == tileTypes.corps) {
            if(point.type == tileTypes.corps) tiles[y][x].element.style.opacity = 0.3
            add(tiles[y][x].element, CrossedTile)
        } else tiles[y][x].element.innerText = tileTypeToText(point.type)
    }

    refreshHighlights()
}

function canAttack(x, y) {
    let ownPawns = []
    for(let y in tiles) {
        for(let x in tiles[y]) {
            const tile = tiles[y][x]
            if(tile.owner == activePlayer && tile.type != tileTypes.corps) ownPawns.push([x, y])
        }
    }

    const canReach = (fromX, fromY, toX, toY) => {
        const roundMove = amount => {
            if(amount > 0) return 1
            if(amount == 0) return 0
            if(amount < 0) return -1
        }
        const hMove = roundMove(toX - fromX)
        const vMove = roundMove(toY - fromY)

        let moveAmounts = 1;
        const calcPos = () => ({x: fromX+hMove*moveAmounts, y: fromY+vMove*moveAmounts})
        let currentPos = calcPos()

        while(currentPos.x != toX || currentPos.y != toY) {
            const currentTile = getTile(currentPos.x, currentPos.y)
            if(currentTile == null) return false
            if(
                currentTile.type == tileTypes.corps ||
                (currentTile.owner != activePlayer && currentTile.type != tileTypes.empty)
            ) return false
            moveAmounts++
            currentPos = calcPos()
        }
        return true
    }

    for(let ownPawn of ownPawns) {
        const [ownX, ownY] = Object.values(ownPawn).map(v => parseInt(v))
        const ownTile = getTile(ownX, ownY)

        if(ownTile.type == tileTypes.x) {
            const vDist = Math.abs(y - ownY)
            const hDist = Math.abs(x - ownX)
            if(vDist == hDist && canReach(ownX, ownY, x, y)) {
                return true
            }
        } else if(ownTile.type == tileTypes.l) {
            if(x == ownX && canReach(ownX, ownY, x, y)) return true
        } else if(ownTile.type == tileTypes.o) {
            const vDist = Math.abs(y - ownY)
            const hDist = Math.abs(x - ownX)
            if(vDist <= 1 && hDist <= 1 && canReach(ownX, ownY, x, y)) return true
        } else if(ownTile.type == tileTypes['-']) {
            if(y == ownY && canReach(ownX, ownY, x, y)) return true
        } else if(ownTile.type == tileTypes['+']) {
            if(
                (x == ownX || y == ownY) &&
                canReach(ownX, ownY, x, y)
            ) return true
        }
    }

    return false
}

function whatCanBePlacedAt(x, y, ittr = 0, alreadyDiscovered = []) {
    if(!alreadyDiscovered.includes(`${x},${y}`)){
        alreadyDiscovered.push(`${x},${y}`)
    } else {
        return []
    }
    if(ittr > 25) return []
    let canPlace = []
    if(getTile(x, y+1)?.owner == activePlayer && getTile(x, y+1)?.type != tileTypes.empty && getTile(x, y+1)?.type != tileTypes.corps && getTile(x, y+1) != null) {
        if(!canPlace.includes(getTile(x, y+1)?.type)) {
            canPlace.push(getTile(x, y+1)?.type)
        }
        const otherBlocks = whatCanBePlacedAt(x, y+1, ittr+1, alreadyDiscovered)
        for(let blck of otherBlocks) {
            if(!canPlace.includes(blck)) canPlace.push(blck)
        }
    }
    if(getTile(x, y-1)?.owner == activePlayer && getTile(x, y-1)?.type != tileTypes.empty && getTile(x, y-1)?.type != tileTypes.corps && getTile(x, y-1) != null) {
        if(!canPlace.includes(getTile(x, y-1)?.type)){
            canPlace.push(getTile(x, y-1)?.type)
        }
        const otherBlocks = whatCanBePlacedAt(x, y-1, ittr+1, alreadyDiscovered)
        for(let blck of otherBlocks) {
            if(!canPlace.includes(blck)) canPlace.push(blck)
        }
    }
    if(getTile(x+1, y)?.owner == activePlayer && getTile(x+1, y)?.type != tileTypes.empty && getTile(x+1, y)?.type != tileTypes.corps && getTile(x+1, y) != null) {
        if(!canPlace.includes(getTile(x+1, y)?.type)){
            canPlace.push(getTile(x+1, y)?.type)
        }
        const otherBlocks = whatCanBePlacedAt(x+1, y, ittr+1, alreadyDiscovered)
        for(let blck of otherBlocks) {
            if(!canPlace.includes(blck)) canPlace.push(blck)
        }
    }
    if(getTile(x-1, y)?.owner == activePlayer && getTile(x-1, y)?.type != tileTypes.empty && getTile(x-1, y)?.type != tileTypes.corps && getTile(x-1, y) != null) {
        if(!canPlace.includes(getTile(x-1, y)?.type)){
            canPlace.push(getTile(x-1, y)?.type)
        }
        const otherBlocks = whatCanBePlacedAt(x-1, y, ittr+1, alreadyDiscovered)
        for(let blck of otherBlocks) {
            if(!canPlace.includes(blck)) canPlace.push(blck)
        }
    }
    return canPlace
}

function switchPlayer() {
    closeActiveTile()
    activePlayer = activePlayer == 1 ? 2 : 1
    const canDoSomething = refreshHighlights()
    if(!canDoSomething) {
        activePlayer = activePlayer == 1 ? 2 : 1
        refreshHighlights()
    }

    if(activePlayer == 1) {
        document.body.style.backgroundColor = 'rgb(50, 0, 0)'
    } else {
        document.body.style.backgroundColor = 'rgb(0, 0, 50)'
    }
}

function highlightActiveTile(x, y) {
    // tiles[y][x].element.style.border = '1px solid yellow'
    tiles[y][x].element.style.backgroundColor = 'rgb(200, 200, 200)'
    tiles[y][x].element.classList.add('active-tile')
}

function closeActiveTile() {
    document.querySelectorAll('.active-tile').forEach(el => {
        // el.style.border = styles.tile.border
        el.style.backgroundColor = styles.tile.backgroundColor
    })
}

function clickTile(x, y) {
    const tile = tiles[y][x]
    if(tile.type == tileTypes.corps) return
    if(tile.type == tileTypes.empty) {
        if(
            (getTile(x, y+1)?.type != tileTypes.empty && getTile(x, y+1)?.type != tileTypes.corps && getTile(x, y+1)?.owner == activePlayer) ||
            (getTile(x, y-1)?.type != tileTypes.empty && getTile(x, y-1)?.type != tileTypes.corps && getTile(x, y-1)?.owner == activePlayer) ||
            (getTile(x+1, y)?.type != tileTypes.empty && getTile(x+1, y)?.type != tileTypes.corps && getTile(x+1, y)?.owner == activePlayer) ||
            (getTile(x-1, y)?.type != tileTypes.empty && getTile(x-1, y)?.type != tileTypes.corps && getTile(x-1, y)?.owner == activePlayer)
        ) {
            closeActiveTile()
            highlightActiveTile(x, y)
            showAddPossibilities(whatCanBePlacedAt(x, y), (v) => {
                scores[activePlayer] += 1
                scoreEls[activePlayer].innerText = scores[activePlayer]
                loadTiles([
                    {
                        pos: [x, y],
                        type: v,
                        owner: activePlayer
                    }
                ])
                history.push(`${activePlayer}p${tileTypeToText(v).toLowerCase()}${x}${y}`)
                switchPlayer()
            })
        }
    } else if (tile.owner != activePlayer) {
        closeAddPossibilities()
        closeActiveTile(x, y)
        if(canAttack(x, y)) {
            scores[activePlayer == 1 ? 2 : 1] -= 1
            scoreEls[activePlayer == 1 ? 2 : 1].innerText = scores[activePlayer == 1 ? 2 : 1]
            const targetTile = getTile(x, y)
            loadTiles([
                {
                    pos: [x, y],
                    type: tileTypes.corps,
                    owner: targetTile.owner
                }
            ])
            history.push(`${activePlayer}a${x}${y}`)
            switchPlayer()
        }
    }
}