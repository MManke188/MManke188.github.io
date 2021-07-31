// 
// a11.js
// Template code for CSC444 Assignment 11
// Joshua A. Levine <josh@email.arizona.edu>
//
// This implements an editable transfer function to be used in concert
// with the volume renderer defined in volren.js
//
// It expects a div with id 'tfunc' to place the d3 transfer function
// editor
//


////////////////////////////////////////////////////////////////////////
// Global variables and helper functions

// colorTF and opacityTF store a list of transfer function control
// points.  Each element should be [k, val] where k is a the scalar
// position and val is either a d3.rgb or opacity in [0,1] 
let colorTF = [];
let opacityTF = [];

// D3 layout variables
let size = 500;
let svg = null;

// Variables for the scales
let xScale = null;
let yScale = null;
let colorScale = null;



////////////////////////////////////////////////////////////////////////
// Visual Encoding portion that handles the d3 aspects

// Function to create the d3 objects
function initializeTFunc() {
  svg = d3.select("#tfunc")
    .append("svg")
    .attr("width", size)
    .attr("height", size);

  //Initialize the axes
  padding = 60
  xScale = d3.scaleLinear()
    .domain([dataRange[0], dataRange[1]])
    .range([padding, size - padding]);

  xAxis = d3.axisBottom(xScale)

  svg.append('g')
    .attr('class', 'xAxis')
    .attr('transform', 'translate(0,' + (size - padding) + ')')
    .call(xAxis)

  yScale = d3.scaleLinear()
    .domain([0, 1])
    .range([size - padding, padding])

  let yAxis = d3.axisLeft(yScale)

  svg.append('g')
    .attr('transform', 'translate(' + padding + ',0)')
    .call(yAxis)

  //Initialize path for the opacity TF curve

  line = svg.append("path")

  //Initialize circles for the opacity TF control points
  let drag = d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);

  svg.append("g")
    .attr("class", "points")
    .selectAll("circle")
    .data(opacityTF)
    .enter()
    .append("circle")
    .attr("index", (d, i) => i)
    .style('cursor', 'pointer')
    .call(drag);

  //Create the color bar to show the color TF
  //TODO: WRITE THIS

  //After initializing, set up anything that depends on the TF arrays
  updateTFunc();
}

// Call this function whenever a new dataset is loaded or whenever
// colorTF and opacityTF change

function updateTFunc() {
  //update scales
  xScale.domain([dataRange[0], dataRange[1]])

  //hook up axes to updated scales
  xAxis = d3.axisBottom(xScale)
  svg.selectAll('.xAxis')
    .call(xAxis)


  //update opacity curves
  d3.select(".points")
    .selectAll("circle")
    .data(opacityTF)
    .attr('cx', (d) => xScale(d[0]))
    .attr('cy', (d) => yScale(d[1]))
    .attr('r', 5)
    .attr('fill', (d, i) => {
      return colorScale(opacityTF[i][0])
    })

  lineCreator = d3.line()
    .x((d) => {
      return xScale(d[0])
    })
    .y((d) => {
      return yScale(d[1])
    })

  line.
    datum(opacityTF)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5).attr('d', lineCreator)

  //update colorbar
  svg.selectAll("rect")
    .remove()
  // Dynamically adjusting the width of each rectangle so that the color bar always has the same size.
  let width = ((size - 2 * padding) / colorTF.length)
  colorBar = svg.selectAll("rect")
    .data(colorTF)
    .enter()
    .append("rect")
    .attr('transform', 'translate(' + padding + ', ' + (size - 30) + ')')
    .attr('height', '30px')
    .attr('width', width + 'px')
    .attr('x', (d, i) => {
      return i * width
    })
    .attr('fill', (d) => {
      return d3.rgb(d[1])
    })
}


// To state, let's reset the TFs and then initialize the d3 SVG canvas
// to draw the default transfer function

resetTFs();
initializeTFunc();


////////////////////////////////////////////////////////////////////////
// Interaction callbacks

// Will track which point is selected
let selected = null;

// Called when mouse down
function dragstarted(event, d) {
  selected = parseInt(d3.select(this).attr("index"));
}

// Called when mouse drags
function dragged(event, d) {
  if (selected != null) {
    let pos = [];
    pos[0] = xScale.invert(event.x);
    pos[1] = yScale.invert(event.y);

    //based on pos and selected, update opacityTF

    //Making sure, that you cannot go outside of the graph
    if (pos[1] < 0) {
      pos[1] = 0
    } else if (pos[1] > 1) {
      pos[1] = 1
    }

    // Ensuring that the selected point cannot go further than the one in front of it
    if (selected !== opacityTF.length - 1) {
      if (pos[0] > opacityTF[selected + 1][0]) {
        pos[0] = opacityTF[selected + 1][0]
      }
    }

    // Ensuring, that the selected point cannot go further than the one behind
    if (selected !== 0) {
      if (pos[0] < opacityTF[selected - 1][0]) {
        pos[0] = opacityTF[selected - 1][0]
      }
    }

    if (selected !== 0 && selected !== opacityTF.length - 1) {
      opacityTF[selected] = pos;
    } else {
      opacityTF[selected][1] = pos[1]
    }

    //update TF window
    updateTFunc();

    //update volume renderer
    updateVR(colorTF, opacityTF);
  }
}

// Called when mouse up
function dragended() {
  selected = null;
}




////////////////////////////////////////////////////////////////////////
// Function to read data

// Function to process the upload
function upload() {
  if (input.files.length > 0) {
    let file = input.files[0];
    console.log("You chose", file.name);

    let fReader = new FileReader();
    fReader.readAsArrayBuffer(file);

    fReader.onload = function (e) {
      let fileData = fReader.result;

      //load the .vti data and initialize volren
      initializeVR(fileData);

      //upon load, we'll reset the transfer functions completely
      resetTFs();

      //Update the tfunc canvas
      updateTFunc();

      //update the TFs with the volren
      updateVR(colorTF, opacityTF, false);
    }
  }
}

// Attach upload process to the loadData button
var input = document.getElementById("loadData");
input.addEventListener("change", upload);



////////////////////////////////////////////////////////////////////////
// Function to respond to buttons that switch color TFs

function resetTFs() {
  makeSequential();
  makeOpacity();
}

// Make a default opacity TF
function makeOpacity() {
  let number = 6
  opacityTF = []

  for (let i = 0; i < number + 1; i++) {
    let fraction = (dataRange[1] - dataRange[0]) * i / number
    opacityTF.push([dataRange[0] + fraction, i / number])
  }
}

// Make a sequential color TF
function makeSequential() {
  let number = 9
  colorScale = d3.scaleLinear()
    .domain([dataRange[0], dataRange[1]])
    .range([d3.schemeOranges[number][0], d3.schemeOranges[number][number - 1]])

  colorTF = []
  for (let i = 0; i < number + 1; i++) {
    let fraction = (dataRange[1] - dataRange[0]) * i / number
    colorTF.push([dataRange[0] + fraction, d3.rgb(colorScale(dataRange[0] + fraction))])
  }
}

// Make a diverging color TF
function makeDiverging() {
  let number = 11
  let scheme = d3.schemeSpectral[number]
  colorScale = d3.scaleLinear()
    .domain([dataRange[0], dataRange[1]])
    .range([scheme[0], scheme[number - 1]])

  colorTF = []
  for (let i = 0; i < number; i++) {
    let fraction = (dataRange[1] - dataRange[0]) * i / number
    colorTF.push([dataRange[0] + fraction, d3.rgb(colorScale(dataRange[0] + fraction))])
  }
}

// Make a categorical color TF
function makeCategorical() {
  let number = 12
  colorScale = d3.scaleQuantize()
    .domain([dataRange[0], dataRange[1]])
    .range(d3.schemePaired)

  colorTF = []
  for (let i = 0; i < number; i++) {
    let fraction = (dataRange[1] - dataRange[0]) * i / number
    colorTF.push([dataRange[0] + fraction, d3.rgb(colorScale(dataRange[0] + fraction))])
  }
}

// Configure callbacks for each button
d3.select("#sequential").on("click", function () {
  makeSequential();
  updateTFunc();
  updateVR(colorTF, opacityTF, false);
});

d3.select("#diverging").on("click", function () {
  makeDiverging();
  updateTFunc();
  updateVR(colorTF, opacityTF, false);
});

d3.select("#categorical").on("click", function () {
  makeCategorical();
  updateTFunc();
  updateVR(colorTF, opacityTF, true);
});

