const svg = d3.select('#display')
svg
  .attr('width', '800px')
  .attr('height', '800px')
  .style('border', '1px solid black')

let countries = "11_SevCatOneNumNestedOneObsPerGroup.csv"

d3.csv(countries)
  .then((data, error) => {
    if (error) {
      console.log(error)
    } else {
      countryData = data.filter((country) => country.value > 0)

      newData = d3.nest()
        .key((d) => d.region)
        .key((d) => d.subregion)
        .key((d) => d.key)
        .entries(countryData);

      newData = {
        data: { name: 'root' },
        values: [...newData]
      }

      regions = []
      subregions = []

      for (e in countryData) {
        regions.push(countryData[e].region)
      }
      regions = [...new Set(regions)];

      for (e in countryData) {
        subregions.push(countryData[e].subregion)
      }
      subregions = [...new Set(subregions)];
      createMap()
    }
  })


function createMap() {
  let hierarchy = d3.hierarchy(newData, (d) => {
    return d['values']
  })
    .sum((d) => d.value)
    .sort((a, b) => b.value - a.value)

  let makeTreemap = d3.treemap()
    .paddingInner(2)
    .size([800, 800])

  makeTreemap(hierarchy)

  console.log(hierarchy)

  let block = svg.selectAll('g')
    .data(hierarchy.descendants().reverse())
    .enter()
    .append('g')

  block.append('rect')
    .attr('class', 'tile')
    .attr('x', (d) => {
      return d['x0']
    })
    .attr('y', (d) => {
      return d['y0']
    })
    .attr('width', (d) => {
      return d['x1'] - d['x0']
    })
    .attr('height', (d) => {
      return d['y1'] - d['y0']
    })
    .attr('fill', (d) => {
      let name = d.data.key
      if (regions.includes(name)) {
        if (name == 'Asia') {
          return 'red'
        } else if (name == 'Africa') {
          return 'green'
        } else if (name == 'Americas') {
          return 'blue'
        } else if (name == 'Europe') {
          return 'yellow'
        } else if (name == 'Oceania') {
          return 'pink'
        }
      } else if (subregions.includes(name)) {
        return 'green'
      } else {
        return 'black'
      }
    })
    .attr('opacity', (d) => {
      let name = d.data.key
      if (regions.includes(name)) {
        return '0.6'
      } else if (subregions.includes(name)) {
        return 0.6
      } else {
        return Math.random() * (0.3);
      }
    })

  text(hierarchy)
}

function text(data) {
  svg.selectAll("text")
    .data(data.descendants().reverse())
    .enter()
    .append("text")
    .text(d => d.data.key)
    .attr('transform', (d) => {
      return 'translate(' + d['x0'] + ', ' + d['y0'] + ')'
    })
    .attr("x", (d) => {
      let name = d.data.key
      if (regions.includes(name)) {
        let font = `${Math.max(Math.min(((d.y1 - d.y0) / 4), (d.x1 - d.x0) / 4))}px Times-Roman`
        let textWidth = displayTextWidth(name, font)
        return ((d.x1 - d.x0) / 2) - textWidth / 2
      } else if (subregions.includes(name)) {
        return 5
      } else {
        let font = `${Math.max(Math.min(((d.y1 - d.y0) / 8), (d.x1 - d.x0) / 8))}px Times-Roman`
        let textWidth = displayTextWidth(name, font)
        return d.x1 - d.x0 - textWidth
      }
    })
    .attr('y', (d) => {
      let name = d.data.key
      if (regions.includes(name)) {
        if (name == 'Oceania') {
          return 10
        } else if (name == "Americas") {
          return (d.y1 - d.y0) / 2 + 40
        } else {
          return (d.y1 - d.y0) / 2 - 5
        }
      } else if (subregions.includes(name)) {
        return (d.y1 - d.y0) / 7
      } else {
        return (d.y1 - d.y0) - 5
      }
    })
    .style('font-size', (d) => {
      let name = d.data.key
      if (regions.includes(name)) {
        if (name == 'Americas') {
          return '45'
        } else if (name == 'Oceania') {
          return '10'
        } else {
          return Math.max(Math.min(((d.y1 - d.y0) / 4), (d.x1 - d.x0) / 4))
        }
      } else if (subregions.includes(name)) {
        return Math.max(Math.min(((d.y1 - d.y0) / 8), (d.x1 - d.x0) / 8))
      } else {
        return Math.max(Math.min(((d.y1 - d.y0) / 10), (d.x1 - d.x0) / 10))
      }
    })
    .style('fill', (d) => {
      let name = d.data.key
      if (regions.includes(name)) {
        return 'white'
      } else if (subregions.includes(name)) {
        return 'white'
      } else {
        return 'black'
      }
    })
    .style("font-weight", (d) => {
      let name = d.data.key
      if (regions.includes(name)) {
        return '600'
      } else if (subregions.includes(name)) {
        return '300'
      } else {
        return '200'
      }
    })
    .style('font-family', 'Times-Roman')
    .raise()
}


function displayTextWidth(text, font) {
  let canvas = displayTextWidth.canvas || (displayTextWidth.canvas = document.createElement("canvas"));
  let context = canvas.getContext("2d");
  context.font = font;
  let metrics = context.measureText(text);
  return metrics.width;
}