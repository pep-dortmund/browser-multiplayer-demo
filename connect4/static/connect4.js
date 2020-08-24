'use strict'

const TOKEN = document.location.pathname.split('/').pop()
const SOUNDS = {
  'new_stone': new Audio('/static/sounds/new_stone.mp3'),
  'win': new Audio('/static/sounds/win.mp3'),
}

// global variables, to be set in onload
let socket
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


function playSound(sound) {
  SOUNDS[sound].currentTime = 0
  SOUNDS[sound].play()
}

/**
 * Calculate the scaling factor from canvas pixel coordinates
 * to our grid of holes
 */
function calcScale() {
  let n_cols = state.board[0].length
  return canvas.width / (n_cols + 2 * PADDING)
}

/**
 * Transform pixel coordinates to hole grid coordinates
 */
function pix2grid(x, y) {
  let scale = calcScale()
  let n_rows = state.board.length
  let col = Math.round(x / scale - 0.5 - PADDING)
  let row = Math.round(n_rows - 0.5 + PADDING - y / scale)
  return [row, col]
}

/**
 * Transform from hole grid coordinates to pixel coordinates
 */
function grid2pix(row, col) {
  let scale = calcScale()
  let n_rows = state.board.length
  let x = (col + 0.5 + PADDING) * scale
  let y = (n_rows - row - 0.5 + PADDING) * scale
  return [x, y]
}


/**
 * Draw a circle at the specified whole coordinate
 * player sets the color 0=empty, 1 = first player, 2 = second player
 */
function drawCircle(row, col, player) {
  const [x, y] = grid2pix(row, col)
  let scale = calcScale()

  ctx.beginPath()
  ctx.arc(
    x, y, 0.45 * scale, 0, 2 * Math.PI,
  )
  ctx.fillStyle = COLORS[player]
  ctx.fill()
}

/**
 * Add a gray circle around a hole for marking the four victory stones
 */
function markCircle(row, col) {
  const [x, y] = grid2pix(row, col)
  let scale = calcScale()

  ctx.beginPath()
  ctx.arc(
    x, y, 0.45 * scale, 0, 2 * Math.PI,
  )
  ctx.strokeStyle = "lightgray"
  ctx.lineWidth = 10
  ctx.stroke()
}

/**
 * Cross out a hole (invalid choice for setting a new stone)
 */
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


/**
 * This is the main function.
 * From the current game state, draw everything on the canvas
 * needed to get the board.
 *
 * Start with the background rectangle, the stones already set,
 * a stone under the current mouse position, the victory stones if
 * the game is finished and the crosses if the player is hovering above
 * an alrady full hole.
 */
function draw() {
  let n_rows = state.board.length
  let n_cols = state.board[0].length

  // draw the background rectangle
  ctx.beginPath()
  ctx.rect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = BOARD_COLOR
  ctx.fill()

  // draw each hole
  for (let row=0; row < state.board.length; row++) {
    for (let col=0; col < state.board[row].length; col++) {
      drawCircle(row, col, state.board[row][col])
    }
  }

  // draw a new stone at the mouse position only if the game
  // is not yet finished
  if (state.mousePos != null && !state.finished) {
    let [row, col] = pix2grid(state.mousePos.x, state.mousePos.y)

    // check that mouse is inside board
    if (!(row < 0 || row >= n_rows || col < 0 || col >= n_cols)) {
      // check that hole is still available
      if (state.board[row][col] == 0) {
        drawCircle(row, col, state.player)
      } else {
        drawCross(row, col)
      }
    }
  }

  // mark the stones that have won the game
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

function onStateChange(new_state) {
  playSound('new_stone')
  state = new_state

  draw()

  if (state.winner !== null) {
    playSound('win')
  }
}

// convert the coordinates of a mouse event (real pixels on the display)
// to canvas coordinates (relative to the width and height properties of the canvas)
// Origin of mouse coordinates is top left of the display, origin of canvas coordinates
// is top left of the canvas.
// width and height do not match the actual size (e.g. the canvas is stretched),
// they need to be scaled.
function mouse2canvas(e) {
  let bbox = canvas.getBoundingClientRect()
  return {
    x: (e.clientX - bbox.left) * canvas.width / bbox.width,
    y: (e.clientY - bbox.top) * canvas.height / bbox.height
  }
}

/**
 * Function to be called whenever the player moves the mouse
 * Get's current mouse position, transforms to grid coordinates
 * and then draws the screen
 */
function onMouseMove(event) {
  // this function might be called before we have gotten the first update
  // from the server.
  if (state) {
    state.mousePos = mouse2canvas(event, canvas)
    draw()
  }
}

function onClick(event) {
  // only do something if game is not yet finished
  if (state.winner == null) {

    // get position of click
    let mousePos = mouse2canvas(event)
    let [row, col] = pix2grid(mousePos.x, mousePos.y)

    // check if the selected position is empty
    if (state.board[row][col] == 0) {
      // send the seleted move to the server
      socket.emit('move', {token: TOKEN, player: state.player, col: col})
    }
  }
}

function onChat(data) {
  // create a new paragraph with text "message"
  let new_message = document.createElement('p')
  let text = document.createTextNode(data.name + ': ' + data.message)
  new_message.appendChild(text)

  // add it to the bottom of the chat window
  let chat = document.getElementById('messages')
  chat.appendChild(new_message)
  // scroll to bottom
  chat.scrollTop = chat.scrollHeight
}


// To make sure, the page is already loaded and we can access
// all elements, we only run the main code once the page is fully
// loaded
window.onload = function(event) {
  // get the canvas html element we want to draw on
  canvas = document.getElementById('connect4')
  ctx = canvas.getContext('2d')

  // create the websocket object and open the connection
  socket = io.connect('/')
  socket.on('state_change', (new_state) => {
    if (state) {
      new_state.mousePos = state.mousePos
    }
    state = new_state
    draw()
  })

  // chat related stuff
  document.getElementById('chatform').addEventListener('submit', (e) => {
      e.preventDefault() // make sure the form is not submitted normally
      let name = document.getElementById('name')
      let message = document.getElementById('message')
      socket.emit('chat', {name: name.value, message: message.value, token: TOKEN})
      message.value = ""
    })


  // register our functions for the corresponding event types on the socket
  socket.onconnect(() => {console.log("connected")})
  socket.on('state_change', onStateChange)
  socket.on('chat', onChat)
  // Join the game channel, receives current game in ack callback
  socket.emit('join', {token: TOKEN}, (new_state) => {
    state = new_state
    draw()
    state.chat.forEach(onChat)
  })

  // add game callbacks to the canvas
  canvas.addEventListener('mousemove', onMouseMove)
  canvas.addEventListener('click', onClick)
}
