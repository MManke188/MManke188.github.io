// 
// a12.js
// Template code for CSC444 Assignment 12
// Joshua A. Levine <josh@email.arizona.edu>
//
// This file provides a template skeleton for visualization vector
// fields using color mapping and glyphs
//
//

////////////////////////////////////////////////////////////////////////
// Global variables, preliminaries

let svgSize = 510;
let bands = 50;

let xScale = d3.scaleLinear().domain([0, bands]).range([5, svgSize - 5]);
let yScale = d3.scaleLinear().domain([0, bands]).range([svgSize - 5, 5]);

function createSvg(sel) {
  return sel
    .append("svg")
    .attr("width", svgSize)
    .attr("height", svgSize);
}

function createGroups(data) {
  return function (sel) {
    return sel
      .append("g")
      .selectAll("*")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", function (d) {
        return "translate(" + xScale(d.Col) + "," + yScale(d.Row) + ") scale(1, -1)";
      });
  };
}

d3.selection.prototype.callReturn = function (callable) {
  return callable(this);
};


// Function to get the length of the vector
let vectorLength = function (d) {
  return Math.sqrt(Math.pow(d.vx, 2) + Math.pow(d.vy, 2))
}

////////////////////////////////////////////////////////////////////////
// PART 1

let magColor = d3.select("#plot-color")
  .callReturn(createSvg)
  .callReturn(createGroups(data));

// This will convert the length of a vector to a color
let colorScale = d3.scaleLinear()
  .domain([0, 2])
  .range([d3.schemeOranges[3][0], d3.schemeOranges[3][2]])

let size = 10
let center = size / 2

magColor.append("rect")
  .attr('height', size) // Sometimes white lines will be seen between rectangles.
  .attr('width', size)  // Increase height and width by a bit to avoid that.
  .attr('fill', d => colorScale(vectorLength(d)))  // Using our colorScale and our vectorlength function to dynamically determine the color of the rect

// Implementing the functionality of the dropdown
let dropdown = document.getElementById('change-scale')
dropdown.addEventListener('change', function (event) {
  let scheme = event.target.value
  let amount = document.getElementById('colorAmount').value
  setScale(colorScale, scheme, amount, 'rect')
  if (inverted) {
    inverted = !inverted
    invert()
  }
})

inverted = false
function invert() {
  inverted = !inverted
  colorScale.range(colorScale.range().reverse())
  d3.selectAll('rect')
    .attr('fill', d => colorScale(vectorLength(d)))
}

function changeScale(amount) {
  let scheme = document.getElementById('change-scale').value
  setScale(colorScale, scheme, amount, 'rect')
  if (inverted) {
    inverted = !inverted
    invert()
  }
}
////////////////////////////////////////////////////////////////////////
// PART 2

let lineGlyph = d3.select("#plot-line")
  .callReturn(createSvg)
  .callReturn(createGroups(data));

lineGlyph.append("line")
  .style('stroke', 'black')
  .attr('x1', d => center - 5 * d.vx / vectorLength(d))  // Start in the middle and go back
  .attr('y1', d => center - 5 * d.vy / vectorLength(d))
  .attr('x2', d => center + 5 * d.vx / vectorLength(d))  // Start in the middle and go forward
  .attr('y2', d => center + 5 * d.vy / vectorLength(d))
////////////////////////////////////////////////////////////////////////
// PART 3

let uniformGlyph = d3.select("#plot-uniform")
  .callReturn(createSvg)
  .callReturn(createGroups(data));

uniformGlyph
  .append("line")
  .style('stroke', 'black')
  .attr('x1', center)
  .attr('y1', center)
  .attr('x2', d => center + 8 * d.vx)
  .attr('y2', d => center + 8 * d.vy)


//Defining the head of the arrow
let color = "black";
let triangleSize = 5;

let triangle = d3.symbol()
  .type(d3.symbolTriangle)
  .size(triangleSize)

uniformGlyph.append("g")
  .attr('class', 'triangle')
  .append('path')
  .attr('d', (d) => {
    let angle = Math.atan2(d.vy, d.vx)
    // How much to move from the end of the line to get to the corners
    let xDiff = -Math.sin(angle)
    let yDiff = Math.cos(angle)

    // How much to move to get to the tip
    let tipDiffX = 2 * Math.cos(angle)
    let tipDiffY = 2 * Math.sin(angle)

    // This is how much the line part of the arrow moves in each direction
    let line = {
      x: center + 8 * d.vx,
      y: center + 8 * d.vy
    }

    let tip = (line.x + tipDiffX) + ' ' + (line.y + tipDiffY)
    let firstCorner = (line.x + xDiff) + ' ' + (line.y + yDiff)
    let thirdCorner = (line.x - xDiff) + ' ' + (line.y - yDiff)

    let triangle = 'M ' + firstCorner + ' L ' + tip + ' L ' + thirdCorner + ' Z'
    return triangle
  })
  .attr("stroke", color)
  .attr("fill", color)
////////////////////////////////////////////////////////////////////////
// PART 4

let randomGlyph = d3.select("#plot-random")
  .callReturn(createSvg)
  .callReturn(createGroups(data));


color = "black";
triangleSize = 5;

triangle = d3.symbol()
  .type(d3.symbolTriangle)
  .size(triangleSize)

//Setting up another color scale
let colorScale2 = d3.scaleLinear()
  .domain([0, 2])
  .range([d3.schemePuBu[3][0], d3.schemePuBu[3][2]])

// We are creating a triangle, similar to the arrow head, that varies in size and color depending on it's magnitude. In order to create randomness we fix the tip at a random position and construct the triangle from there
randomGlyph.append("g")
  .append('path')
  .attr('class', 'triangle')
  .attr('d', (d) => {
    let angle = Math.atan2(d.vy, d.vx)

    let xDiff = -Math.sin(angle) * 1.5
    let yDiff = Math.cos(angle) * 1.5

    let tipDiffX = Math.cos(angle) * 9 * vectorLength(d)
    let tipDiffY = Math.sin(angle) * 9 * vectorLength(d)


    let max = size
    let min = 0
    let x = Math.random() * (max - min) + min
    let y = Math.random() * (max - min) + min

    // Create a fixed tip at a random location
    let tip = x + ' ' + y

    let firstCorner = (x - tipDiffX + xDiff) + ' ' + (y - tipDiffY + yDiff)
    let thirdCorner = (x - tipDiffX - xDiff) + ' ' + (y - tipDiffY - yDiff)

    let triangle = 'M ' + firstCorner + ' L ' + tip + ' L ' + thirdCorner + ' Z'
    return triangle
  })
  .attr('stroke', d => colorScale2(vectorLength(d)))  // Dynamically adjusting the color of the triangle
  .attr('fill', d => colorScale2(vectorLength(d)))


// Implementing the functionality of the dropdown
let dropdown2 = document.getElementById('change-scale2')
dropdown2.addEventListener('change', function (event) {
  let scheme = event.target.value
  let amount = document.getElementById('colorAmount2').value
  setScale(colorScale2, scheme, amount, '.triangle', true)
  if (inverted2) {
    inverted2 = !inverted2
    invert2()
  }
})

inverted2 = false
function invert2() {
  inverted2 = !inverted2
  colorScale2.range(colorScale2.range().reverse())
  d3.selectAll('.triangle')
    .attr('fill', d => colorScale2(vectorLength(d)))
    .attr('stroke', d => colorScale2(vectorLength(d)))
}

function changeScale2(amount) {
  let scheme = document.getElementById('change-scale2').value
  setScale(colorScale2, scheme, amount, '.triangle', true)
  if (inverted2) {
    inverted2 = !inverted2
    invert2()
  }
}

function setScale(scale, scheme, amount, item, isTwo) {
  let domain = []
  let range = []
  for (let i = 0; i < amount; i++) {
    domain.push(2 * i / (amount - 1))
    if (amount >= 3) {
      range.push(d3[scheme][amount][i])
    } else {
      range.push(d3[scheme][3][i * 2])
    }
  }
  scale.domain(domain).range(range)
  d3.selectAll(item)
    .attr('fill', d => scale(vectorLength(d)))
  if (isTwo) {
    d3.selectAll(item).attr('stroke', d => scale(vectorLength(d)))
  }
}