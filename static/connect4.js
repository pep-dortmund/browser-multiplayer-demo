'use strict'

const N_ROWS = 6
const N_COLS = 7
const PADDING = 0.1
const BOARD_COLOR = "DarkBlue"
const DIRECTIONS = {
  'horizontal': [ 0, 1],
  'vertical':   [ 1, 0],
  'ascending':  [ 1, 1],
  'descending': [-1, 1],
}

const COLORS = {
  0: "white",
  1: "crimson",
  2: "#ffcc00"
}

/**
 * Initial board creation
 * just 2 N_ROWS x N_COLS array of zeros
 */
function initState() {
  let board = new Array(N_ROWS)
  for (let row=0; row < N_ROWS; row++) {
    board[row] = new Array(N_COLS)
    board[row].fill(0)
  }
  return {
    currentPlayer: 1,
    board: board,
    mousePos: null,
    winner: null,
  }
}

let state = initState()

function checkVictory(board) {
  // check horizontally
  for (let row=0; row < N_ROWS; row++) {
    let res = checkSingle(board, row, 0, "horizontal")
    if (res != null) return res
  }

  // check vertically
  for (let col=0; col < N_COLS; col++) {
    let res = checkSingle(board, 0, col, "vertical")
    if (res != null) return res
  }

  // check diagonally ascending
  // first, check starting from row 0
  for (let col=0; col < N_COLS; col++) {
    let res = checkSingle(board, 0, col, "ascending")
    if (res != null) return res
  }

  // then from col 0
  for (let row=1; row < N_COLS; row++) {
    let res = checkSingle(board, row, 0, "ascending")
    if (res != null) return res
  }

  // first, check starting from the top row
  for (let col=0; col < N_COLS; col++) {
    let res = checkSingle(board, N_ROWS - 1, col, "descending")
    if (res != null) return res
  }

  // then from col 0
  for (let row=0 ; row < N_ROWS; row++) {
    let res = checkSingle(board, row, 0, "descending")
    if (res != null) return res
  }

  return null
}


function checkSingle(board, row, col, direction) {
  let n_found = 0
  let current = 0
  let [drow, dcol] = DIRECTIONS[direction]

  while (row >= 0 && row < N_ROWS && col >= 0 && col < N_COLS) {
    let owner = board[row][col]

    if (owner == 0) {
      n_found = 0
      current = 0
    } else if (owner == current) {
      n_found += 1
    } else {
      n_found = 1
      current = owner
    }
    if (n_found == 4) {
      return {player: current, row: row, col: col, direction: direction}
    }

    row += drow
    col += dcol
  }

  return null
}

function pix2grid(x, y, scale) {
  let col = Math.round(x / scale - 0.5 - PADDING)
  let row = Math.round(N_ROWS - 0.5 + PADDING - y / scale)
  return [row, col]
}

function grid2pix(row, col, scale) {
  let x = (col + 0.5 + PADDING) * scale
  let y = (N_ROWS - row - 0.5 + PADDING) * scale
  return [x, y]
}


function drawCircle(ctx, row, col, scale, player) {
  ctx.beginPath()
  const [x, y] = grid2pix(row, col, scale)
  ctx.arc(
    x, y, 0.45 * scale, 0, 2 * Math.PI,
  )
  ctx.fillStyle = COLORS[player]
  ctx.fill()
}

function markCircle(ctx, row, col, scale) {
  ctx.beginPath()
  const [x, y] = grid2pix(row, col, scale)
  ctx.arc(
    x, y, 0.45 * scale, 0, 2 * Math.PI,
  )
  ctx.strokeStyle = "lightgray"
  ctx.lineWidth = 10
  ctx.stroke()
}

function drawCross(ctx, row, col, scale) {
  const [x, y] = grid2pix(row, col, scale)

  ctx.beginPath()
  ctx.lineWidth = 10
  ctx.moveTo(x - 0.45 * scale, y - 0.45 * scale)
  ctx.lineTo(x + 0.45 * scale, y + 0.45 * scale)
  ctx.stroke()

  ctx.beginPath()
  ctx.lineWidth = 10
  ctx.moveTo(x - 0.45 * scale, y + 0.45 * scale)
  ctx.lineTo(x + 0.45 * scale, y - 0.45 * scale)
  ctx.stroke()
}


function draw(canvas, ctx, state) {
  let scale = canvas.width / (N_COLS + 2 * PADDING)

  ctx.beginPath()
  ctx.rect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = BOARD_COLOR
  ctx.fill()

  for (let row=0; row < N_ROWS; row++) {
    for (let col=0; col < N_COLS; col++) {
      drawCircle(ctx, row, col, scale, state.board[row][col])
    }
  }

  if (state.mousePos != null) {
    let [row, col] = pix2grid(state.mousePos.x, state.mousePos.y, scale)

    if (!(row < 0 || row >= N_ROWS || col < 0 || col >= N_COLS)) {
      if (state.board[row][col] == 0) {
        drawCircle(ctx, row, col, scale, state.currentPlayer)
      } else {
        drawCross(ctx, row, col, scale)
      }
    }
  }

  if (state.winner != null) {
    let [drow, dcol] = DIRECTIONS[state.winner.direction]
    let row = state.winner.row
    let col = state.winner.col
    for (let i=0; i < 4; i++) {
      markCircle(ctx, row, col, scale)
      // winner position is the last one checked
      // so we need to go backwards
      row -= drow
      col -= dcol
    }
  }
}

function mouse2canvas(event, canvas) {
  let bbox = canvas.getBoundingClientRect()
  return {
    x: (event.clientX - bbox.left) * canvas.width / bbox.width,
    y: (event.clientY - bbox.top) * canvas.height / bbox.height
  }
}

window.onload = function(event) {

  const canvas = document.getElementById('connect4')
  const ctx = canvas.getContext('2d')

  draw(canvas, ctx, state)

  canvas.addEventListener('mousemove', function(event) {
    state.mousePos = mouse2canvas(event, canvas)
    draw(canvas, ctx, state)
  })

  canvas.addEventListener('click', function(event) {

    // restart game on click if we have a winner
    if (state.winner != null) {
      state = initState()
    } else {
      let mousePos = mouse2canvas(event, canvas)
      let scale = canvas.width / (N_COLS + 2 * PADDING)
      let [row, col] = pix2grid(mousePos.x, mousePos.y, scale)

      // add new stone to lowest free spot
      for (row = 0; row < N_ROWS; row++) {
        if (state.board[row][col] == 0) {
          state.board[row][col] = state.currentPlayer
          state.currentPlayer = state.currentPlayer == 1 ? 2 : 1
          break
        }
      }

      // check if game is finished
      state.winner = checkVictory(state.board)
    }

    // finally draw
    draw(canvas, ctx, state)
  })
}
