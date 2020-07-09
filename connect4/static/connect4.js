'use strict'

let socket = io();
let state
let canvas
let ctx

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

function calcScale() {
  let n_cols = state.board[0].length
  return canvas.width / (n_cols + 2 * PADDING)
}

function pix2grid(x, y) {
  let scale = calcScale()
  let n_rows = state.board.length
  let col = Math.round(x / scale - 0.5 - PADDING)
  let row = Math.round(n_rows - 0.5 + PADDING - y / scale)
  return [row, col]
}

function grid2pix(row, col) {
  let scale = calcScale()
  let n_rows = state.board.length
  let x = (col + 0.5 + PADDING) * scale
  let y = (n_rows - row - 0.5 + PADDING) * scale
  return [x, y]
}


function drawCircle(row, col, player) {
  let scale = calcScale()
  ctx.beginPath()
  const [x, y] = grid2pix(row, col, scale)
  ctx.arc(
    x, y, 0.45 * scale, 0, 2 * Math.PI,
  )
  ctx.fillStyle = COLORS[player]
  ctx.fill()
}

function markCircle(row, col) {
  let scale = calcScale()
  ctx.beginPath()
  const [x, y] = grid2pix(row, col, scale)
  ctx.arc(
    x, y, 0.45 * scale, 0, 2 * Math.PI,
  )
  ctx.strokeStyle = "lightgray"
  ctx.lineWidth = 10
  ctx.stroke()
}

function drawCross(row, col) {
  let scale = calcScale()
  const [x, y] = grid2pix(row, col)

  ctx.beginPath()
  ctx.lineWidth = 10
  ctx.moveTo(x - 0.45 * scale, y - 0.45 * scale)
  ctx.lineTo(x + 0.45 * scale, y + 0.45 * scale)
  ctx.strokeStyle = "black"
  ctx.stroke()

  ctx.beginPath()
  ctx.lineWidth = 10
  ctx.moveTo(x - 0.45 * scale, y + 0.45 * scale)
  ctx.lineTo(x + 0.45 * scale, y - 0.45 * scale)
  ctx.strokeStyle = "black"
  ctx.stroke()
}


function draw() {
  let n_rows = state.board.length
  let n_cols = state.board[0].length
  let scale = calcScale()

  ctx.beginPath()
  ctx.rect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = BOARD_COLOR
  ctx.fill()

  for (let row=0; row < state.board.length; row++) {
    for (let col=0; col < state.board[row].length; col++) {
      drawCircle(row, col, state.board[row][col])
    }
  }

  if (state.mousePos != null && state.winner === null) {
    let [row, col] = pix2grid(state.mousePos.x, state.mousePos.y, scale)

    if (!(row < 0 || row >= n_rows || col < 0 || col >= n_cols)) {
      if (state.board[row][col] == 0) {
        drawCircle(row, col, state.player)
      } else {
        drawCross(row, col)
      }
    }
  }

  if (state.winner != null) {
    let [drow, dcol] = DIRECTIONS[state.winner.direction]
    let row = state.winner.row
    let col = state.winner.col
    for (let i=0; i < 4; i++) {
      markCircle(row, col)
      // winner position is the last one checked
      // so we need to go backwards
      row -= drow
      col -= dcol
    }
  }
}

function mouse2canvas(event) {
  let bbox = canvas.getBoundingClientRect()
  return {
    x: (event.clientX - bbox.left) * canvas.width / bbox.width,
    y: (event.clientY - bbox.top) * canvas.height / bbox.height
  }
}

window.onload = function(event) {
  canvas = document.getElementById('connect4')
  ctx = canvas.getContext('2d')

  socket.on('state_change', (new_state) => {
    state = new_state
    draw()
  })

  canvas.addEventListener('mousemove', (event) => {
    state.mousePos = mouse2canvas(event, canvas)
    draw()
  })

  canvas.addEventListener('click', function(event) {

    // restart game on click if we have a winner
    if (state.winner != null) {
      socket.emit('reset')
    } else {
      let mousePos = mouse2canvas(event)
      let [row, col] = pix2grid(mousePos.x, mousePos.y)

      if (state.board[row][col] == 0) {
        socket.emit('move', {player: state.player, col: col})
      }
    }
  })

}
