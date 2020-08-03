"use strict;"
let draw = false

const LENGTH = 50
const WIDTH = 10


// which segments are on for the numbers 0 - 9
const NUMBERS = [
  [1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 0, 0, 0, 0],
  [1, 1, 0, 1, 1, 0, 1],
  [1, 1, 1, 1, 0, 0, 1],
  [0, 1, 1, 0, 0, 1, 1],
  [1, 0, 1, 1, 0, 1, 1],
  [1, 0, 1, 1, 1, 1, 1],
  [1, 1, 1, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 1, 1]
]


function relative2canvas(ctx, pos) {
  let bbox = ctx.canvas.getBoundingClientRect()
  return {
    x: pos.x * ctx.canvas.WIDTH,
    y: pos.y * ctx.canvas.height,
  }
}

/**
 * Draw a single element of a seven segment display
 */
function drawVerticalElement(ctx, x, y, color) {
  ctx.fillStyle = color

  for (const sign of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(x - WIDTH / 2, y + sign * LENGTH / 2)
    ctx.lineTo(x + WIDTH / 2, y + sign * LENGTH / 2)
    ctx.lineTo(x, y + sign * (LENGTH / 2 + WIDTH / 2))
    ctx.closePath()
    ctx.fill()
  }

  ctx.fillRect(x - WIDTH / 2, y - LENGTH / 2, WIDTH, LENGTH)
}

function drawHorizontalElement(ctx, x, y, color) {
  ctx.fillStyle = color;

  for (const sign of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(x + sign * LENGTH / 2, y - WIDTH / 2)
    ctx.lineTo(x + sign * LENGTH / 2, y + WIDTH / 2)
    ctx.lineTo(x + sign * (LENGTH / 2 + WIDTH / 2), y)
    ctx.closePath()
    ctx.fill()
  }

  ctx.fillRect(x - LENGTH / 2, y - WIDTH / 2, LENGTH, WIDTH)
}

function drawSevenSegmentDisplay(ctx, x, y, state=[1, 1, 1, 1, 1, 1, 1]) {

  let colors = ["#202020", "red"]
  let eps = WIDTH * 0.75

  drawHorizontalElement(ctx, x, y - LENGTH - 2 * eps, colors[state[0]])
  drawVerticalElement(ctx, x + LENGTH / 2 + eps, y -  LENGTH / 2 - eps, colors[state[1]])
  drawVerticalElement(ctx, x + LENGTH / 2 + eps, y + LENGTH / 2 + eps, colors[state[2]])
  drawHorizontalElement(ctx, x, y + LENGTH + 2 * eps, colors[state[3]])
  drawVerticalElement(ctx, x - LENGTH / 2 - eps, y + LENGTH / 2 + eps, colors[state[4]])
  drawVerticalElement(ctx, x - LENGTH / 2 - eps, y -  LENGTH / 2 - eps, colors[state[5]])
  drawHorizontalElement(ctx, x, y, colors[state[6]])
}

function drawClock(ctx) {
  let time = new Date()

  let LENGTH = 50
  let WIDTH = 10
  let y = 100

  let seconds = time.getSeconds()
  drawSevenSegmentDisplay(ctx, 600, y, NUMBERS[Math.floor(seconds / 10)])
  drawSevenSegmentDisplay(ctx, 700, y, NUMBERS[seconds % 10])

  let minutes = time.getMinutes()
  drawSevenSegmentDisplay(ctx, 350, y, NUMBERS[Math.floor(minutes / 10)])
  drawSevenSegmentDisplay(ctx, 450, y, NUMBERS[minutes % 10])

  let hour = time.getHours()
  drawSevenSegmentDisplay(ctx, 100, y, NUMBERS[Math.floor(hour / 10)])
  drawSevenSegmentDisplay(ctx, 200, y, NUMBERS[hour % 10])

  ctx.fillStyle = "red";

  for (const x of [275, 525]) {
    for (const y of [75, 125]) {
      ctx.beginPath()
      ctx.arc(x, y, WIDTH, 0, 2 * Math.PI)
      ctx.fill()
    }
  }

}


window.onload = () => {
  let canvas = document.getElementById('canvas')
  let ctx = canvas.getContext("2d")

  ctx.fillStyle = "black"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawClock(ctx)
  window.setInterval(() => {drawClock(ctx)}, 100)
}
