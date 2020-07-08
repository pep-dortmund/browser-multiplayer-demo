'use strict'

const N_ROWS = 6
const N_COLS = 7
const PADDING = 0.1
const BOARD_COLOR = "DarkBlue"

const COLORS = {
  0: "white",
  1: "crimson",
  2: "#ffcc00"
}

let state = {
  currentPlayer: 1,
  board: createBoard(),
  mousePos: null
}


/**
 * Initial board creation
 * just 2 N_ROWS x N_COLS array of zeros
 */
function createBoard() {
  let board = new Array(N_ROWS)
  for (let row=0; row < N_ROWS; row++) {
    board[row] = new Array(N_COLS)
    board[row].fill(0)
  }
  return board
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
    if (state.board[row][col] == 0) {
      drawCircle(ctx, row, col, scale, state.currentPlayer)
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
    let mousePos = mouse2canvas(event, canvas)
    let scale = canvas.width / (N_COLS + 2 * PADDING)
    let [row, col] = pix2grid(mousePos.x, mousePos.y, scale)

    for (row = 0; row < N_ROWS; row++) {
      if (state.board[row][col] == 0) {
        state.board[row][col] = state.currentPlayer
        break
      }
    }

    state.currentPlayer = state.currentPlayer == 1 ? 2 : 1
  })
}
