"use strict;"
let color = "red"
let draw = false
let size = 5


function mouse2canvas(ctx, e) {
  let bbox = ctx.canvas.getBoundingClientRect()
  return {
    x: (e.x - bbox.x) / bbox.width * ctx.canvas.width,
    y: (e.y - bbox.y) / bbox.height * ctx.canvas.height,
  }
}

function drawCircle(ctx, pos) {
  ctx.beginPath()
  ctx.fillStyle = color
  ctx.arc(pos.x, pos.y, 0.5 * size, 0, 2 * Math.PI)
  ctx.fill()
}

function startLine(ctx, pos) {
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    ctx.strokeStyle = color
    ctx.lineWidth = size
}

function finishLine(ctx, pos) {
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
}


window.onload = () => {
  let canvas = document.getElementById('canvas')
  let ctx = canvas.getContext("2d")

  let colorPicker = document.getElementById("color")
  colorPicker.onchange = (e) => {
    color = colorPicker.value
  }

  let sizePicker = document.getElementById("size")
  sizePicker.onchange = (e) => {
    size = sizePicker.value
  }

  canvas.onmousedown = (e) => {
    draw = true
    let pos = mouse2canvas(ctx, e)
    drawCircle(ctx, pos)
    startLine(ctx, pos)
  }

  canvas.onmouseup = (e) => {
    pos = mouse2canvas(ctx, e)
    finishLine(ctx, pos)
    draw = false
  }

  canvas.onmousemove = (e) => {
    if (draw) {
      pos = mouse2canvas(ctx, e)
      finishLine(ctx, pos)
      drawCircle(ctx, pos)
      startLine(ctx, pos)
    }
  }
}
