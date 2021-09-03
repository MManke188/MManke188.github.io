const difficulties = {
  easy: { mines: 10, width: 9, height: 9, fieldWidth: 40, fieldHeight: 40 },
  medium: { mines: 40, width: 16, height: 16, fieldWidth: 40, fieldHeight: 40 },
  hard: { mines: 99, width: 30, height: 16, fieldWidth: 75, fieldHeight: 40 }
}

let difficulty = 'hard'
const field = document.getElementById('field')
const menu = document.getElementById('menu')

field.addEventListener('mousedown', exitedSmile)
field.addEventListener('mouseup', delayedSmile)

function exitedSmile() {
  document.getElementById('newGame').innerHTML = '<img src="Images/shock.png" id="smiley">'
}

function smile() {
  document.getElementById('newGame').innerHTML = '<img src="Images/smile.png" id="smiley">'
}

function delayedSmile() {
  setTimeout(smile, 100);
}

let board
let firstClick

function generateBoard(update) {
  smile()
  firstClick = true
  difficulty = update || difficulty
  let tile = {}
  field.style.width = difficulties[difficulty].fieldWidth + 'vw'
  field.style.height = difficulties[difficulty].fieldHeight + 'vw'
  tile.width = difficulties[difficulty].fieldWidth / difficulties[difficulty].width
  tile.height = difficulties[difficulty].fieldHeight / difficulties[difficulty].height

  field.innerHTML = ''
  for (let i = 0; i < difficulties[difficulty].width; i++) {
    for (let j = 0; j < difficulties[difficulty].height; j++) {
      field.innerHTML += '<button class="unopened tile" style="width: ' + tile.width + 'vw; height: ' + tile.height + 'vw; left: ' + tile.width * i + 'vw; top: ' + tile.height * j + 'vw;" onclick="uncover(this)" id="' + j + ',' + i + '"></button>'
    }
  }
  setUpMenu()
}

function setUpMenu() {
  menu.style.width = field.style.width
  menu.style.borderTop = "0.27vw solid grey"
  menu.style.borderLeft = "0.27vw solid grey"
  menu.style.borderBottom = "0.27vw solid whitesmoke"
  menu.style.borderRight = "0.27vw solid whitesmoke"
}

function fillBoard(difficulty, ele) {
  Array.from(document.getElementsByClassName('tile')).forEach((tile) => {
    tile.addEventListener('contextmenu', flag)
  })

  board = []
  for (let i = 0; i < difficulties[difficulty].height; i++) {
    board.push([])
    for (let j = 0; j < difficulties[difficulty].width; j++) {
      board[i].push('')
    }
  }


  for (let i = 0; i < difficulties[difficulty].mines; i++) {
    let row = Math.floor(Math.random() * difficulties[difficulty].height)
    let col = Math.floor(Math.random() * difficulties[difficulty].width)
    while (board[row][col] == 'mine' || getSurroundingTiles(getTile(ele)).some(e => e.row == row && e.column == col) || (getTile(ele).row == row && getTile(ele).column == col)) {
      row = Math.floor(Math.random() * difficulties[difficulty].height)
      col = Math.floor(Math.random() * difficulties[difficulty].width)
    }
    board[row][col] = 'mine'
  }

  return board
}


function uncover(ele) {
  if (firstClick) {
    fillBoard(difficulty, ele)
    firstClick = false
  }

  if (!window.event.ctrlKey) {
    ele.onclick = null
    ele.onmouseout = null
    ele.onmousedown = null
    tile = getTile(ele)

    if (tile.value == 'mine') {
      gameLost(ele)
    } else {
      ele.classList.remove('unopened')
      ele.style.backgroundImage = "url('Images/" + tile.value + ".PNG')"
      ele.style.backgroundSize = 'cover'
      if (tile.value == 0) {
        uncoverAllSurrounding(tile)
      }
    }

    let won = false
    Array.from(document.getElementsByClassName('tile')).some((e) => {
      if (((e.onclick !== null || tile.value == 'mine') && getTile(e).value !== 'mine') || (e.classList.contains('flagged') && getTile(e).value !== 'mine')) {
        won = false
        return !won
      } else {
        won = true
      }
    })
    if (won) {
      gameWon()
    }
  }


}

function uncoverAllSurrounding(tile) {
  getSurroundingTiles(tile).forEach((tile) => {
    getElement(tile).click()
  })
}

function getTile(element) {
  let tile = {}
  tile.row = Number(element.id.slice(0, element.id.indexOf(',')))
  tile.column = Number(element.id.slice(element.id.indexOf(',') + 1,))

  tile.value = getValue(tile)

  return tile
}

function getValue(tile) {
  let value = 0
  if (board[tile.row][tile.column] == 'mine') {
    value = 'mine'
  } else {
    getSurroundingTiles(tile).forEach((t) => {
      if (board[t.row][t.column] == 'mine') {
        value++
      }
    })
  }
  return value
}

function flag() {
  window.event.preventDefault()
  let ele = window.event.srcElement
  if (ele.classList.contains('flagged')) {
    unflag(ele)
  } else {
    ele.classList.add('flagged')
    ele.style.backgroundImage = "url('Images/flag.png')"
    ele.style.backgroundSize = 'cover'
    ele.onclick = null
  }
}

function unflag(ele) {
  ele.classList.remove('flagged')
  ele.style.backgroundImage = "url('Images/unopened.png')"
  ele.style.backgroundSize = 'cover'
  ele.addEventListener('click', function () {
    uncover(ele)
  })

}

function gameLost(click) {
  setTimeout(() => {
    document.getElementById('newGame').innerHTML = '<img src="Images/lost.png" id="smiley">'
  }, 100)
  board.forEach((row, i) => {
    row.forEach((e, j) => {
      let id = i + ',' + j
      let ele = document.getElementById(id)
      if (e == 'mine') {
        ele.style.backgroundImage = "url('Images/mine.png')"
        if (ele == click) {
          ele.style.backgroundImage = "url('Images/clicked_mine.png')"
          ele.style.backgroundColor = 'red'
        }
        ele.style.backgroundSize = 'cover'
      }
      ele.onclick = null
      ele.onmouseout = null
      ele.onmousedown = null
    })
  })
}

function gameWon() {
  setTimeout(() => {
    document.getElementById('newGame').innerHTML = '<img src="Images/victory.png" id="smiley">'
  }, 100)

  Array.from(document.getElementsByClassName('tile')).forEach((e) => {
    if (e.onclick !== null) {
      e.style.backgroundImage = "url('Images/mine.png')"
      e.style.backgroundSize = 'cover'
    }
  })
}

function getSurroundingTiles(tile) {
  let tiles = []
  tiles.push({ row: tile.row, column: tile.column - 1 })
  tiles.push({ row: tile.row, column: tile.column + 1 })
  if (tile.row !== difficulties[difficulty].height - 1) {
    tiles.push({ row: tile.row + 1, column: tile.column - 1 })
    tiles.push({ row: tile.row + 1, column: tile.column })
    tiles.push({ row: tile.row + 1, column: tile.column + 1 })
  }
  if (tile.row !== 0) {
    tiles.push({ row: tile.row - 1, column: tile.column - 1 })
    tiles.push({ row: tile.row - 1, column: tile.column })
    tiles.push({ row: tile.row - 1, column: tile.column + 1 })
  }
  tiles = tiles.filter((tile) => board[tile.row][tile.column] !== undefined)
  return tiles
}

function getElement(tile) {
  let id = tile.row + ',' + tile.column
  let element = document.getElementById(id)

  return element
}

function languageChange(lang) {
  let labels = Array.from(document.querySelectorAll('label'))
  switch (lang) {
    case 'RUS':
      labels.forEach((label, i) => {
        if (i == 0) {
          label.innerHTML = "Простой"
        } else if (i == 1) {
          label.innerHTML = "Средний"
        } else {
          label.innerHTML = "Тяжелый"
        }
      })
      break;
    case 'GER':
      labels.forEach((label, i) => {
        if (i == 0) {
          label.innerHTML = "Leicht"
        } else if (i == 1) {
          label.innerHTML = "Mittel"
        } else {
          label.innerHTML = "Schwer"
        }
      })
      break;
    case 'ENG':
      labels.forEach((label, i) => {
        if (i == 0) {
          label.innerHTML = "Easy"
        } else if (i == 1) {
          label.innerHTML = "Medium"
        } else {
          label.innerHTML = "Hard"
        }
      })
      break;
  }
}

generateBoard()