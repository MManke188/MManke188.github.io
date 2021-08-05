const svg = d3.select('#display')
svg
  .attr('width', '1000px')
  .attr('height', '600px')
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


let createMap = () => {
  let hierarchy = d3.hierarchy(newData, (d) => {
    return d['values']
  })
    .sum((d) => d.value)
    .sort((a, b) => b.value - a.value)

  let makePack = d3.pack()
    .size([1000, 600])

  makePack(hierarchy)

  console.log(hierarchy)

  let block = svg.selectAll('g')
    .data(hierarchy)
    .enter()
    .append('g')
    .attr("transform", d => `translate(${d.x + 1},${d.y + 1})`);

  block.append('circle')
    .attr('class', 'tile')
    .attr('r', d => d.r)
    .attr('dx', d => d.x)
    .attr('dy', d => d.y)
    .attr('fill', (d) => {
      let name = d.data.key
      if (regions.includes(name)) {
        return 'peru'
      } else if (subregions.includes(name)) {
        return 'sienna'
      } else if (!d.data.hasOwnProperty('data')) {
        return 'white'
      } else {
        return 'burlywood'
      }
    })
    .attr('opacity', '0.8')

  text(hierarchy)
}

function text(data) {
  svg.selectAll("text")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "label")
    .text((d) => {
      let name = d.data.key
      if (regions.includes(name)) {
        return name
      }
    })
    .attr('font-family', 'Times-Roman')
    .attr("x", function (d) {
      let name = d.data.key
      let textWidth = displayTextWidth(name, '30px Times-Roman')
      if (name == 'Oceania') {
        textWidth = displayTextWidth(name, '20px Times-Roman')
      }
      return d.x - textWidth / 2;
    })
    .attr("y", function (d) {
      return d.y;
    })
    .attr("font-size", (d) => {
      if (d.data.key == 'Oceania') {
        return "20px"
      } else {
        return "30px"
      }
    })
    .attr("font-weight", "600")
}

function displayTextWidth(text, font) {
  let canvas = displayTextWidth.canvas || (displayTextWidth.canvas = document.createElement("canvas"));
  let context = canvas.getContext("2d");
  context.font = font;
  let metrics = context.measureText(text);
  return metrics.width;
}
