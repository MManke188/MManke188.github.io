let svg = d3.select('#display')
width = 700
height = 700
padding = 60
svg.attr('width', width)
  .attr('height', height)
  .style('border', '1px solid black')
  .style('margin', '40px 20px')


function load() {
  let obesityData = d3.csv("https://raw.githubusercontent.com/CrazyDaffodils/Interactive-Choropleth-Map-Using-Python/master/bokeh-app/data/obesity.csv")
  let covidData = d3.json("https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.json")
  let countryCodes = d3.csv("https://gist.githubusercontent.com/tadast/8827699/raw/f5cac3d42d16b78348610fc4ec301e9234f82821/countries_codes_and_coordinates.csv")

  Promise.all([
    covidData,
    obesityData,
    countryCodes
  ]).then((data, error) => {
    if (!error) {
      prepareData(data[0], data[1], data[2])
    }
  })
}

function prepareData(covidData, obesityData, countryCodes) {
  obesityData = obesityData.filter((d) => d.Year == '2016')
  covidData = sort(covidData)
  obesityData = obesityData.map((d) => {
    return {
      country: d.Entity,
      obesity: d['Indicator:Prevalence of obesity among adults, BMI &GreaterEqual; 30 (age-standardized estimate) (%) - Age Group:18+  years - Sex:Both sexes (%)']
    }
  })
  countryCodes = countryCodes.map((d) => {
    return {
      country: d.Country,
      code: d['Alpha-3 code']
    }
  })
  covidData.forEach((d) => {
    countryCodes.forEach((e) => {
      if (e.code.includes(d[0])) {
        d[0] = e.country
      }
    })
  })
  obesityData.forEach((d) => {
    covidData.forEach((e) => {
      if (e[0].includes(d.country)) {
        e[0] = d.country
      }
    })
  })
  for (let i = 0, j = 0; i < obesityData.length; i++, j++) {
    if (obesityData[i].country !== covidData[j][0]) {
      while (obesityData[i].country !== covidData[j][0] && j - i < 40) {
        j++
      }
      if (obesityData[i].country !== covidData[j][0]) {
        obesityData.splice(i, 1)
        i--
        j -= 41
      }
    }
  }
  for (let i = 0; i < obesityData.length; i++) {
    if (obesityData[i].country !== covidData[i][0]) {
      covidData.splice(i, 1)
      i--
    }
  }
  covidData = covidData.map((d) => {
    return {
      country: d[0],
      dpm: d[1].data
    }
  })
  covidData.forEach((d) => {
    d.dpm = d.dpm.map(e => e['total_deaths_per_million'])
    d.dpm = d.dpm[d.dpm.length - 1]
  })
  obesityData.forEach((d, i) => {
    covidData[i].obesity = d.obesity
  })
  covidData = covidData.filter((e) => {
    return e.dpm != undefined
  })
  console.log(covidData)
  createScatter(covidData)
}

function sort(data) {
  let entries = Object.entries(data);

  // This filters out all the continents
  sorted = entries.filter((e) => {
    return e[1].continent !== undefined
  })

  return sorted
}

function createScatter(data) {
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => Number(d.obesity))])
    .range([padding, width - padding]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(d3.extent(data, d => d.dpm))])
    .range([height - padding, padding]);


  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  svg.append("g")
    .attr("transform", "translate(0, " + (height - padding) + ")")
    .call(xAxis);

  svg.append('g')
    .attr('transform', 'translate(' + padding + ', 0)')
    .call(yAxis)

  let circles = data.filter((d) => d.obesity !== undefined)


  svg
    .selectAll("circle")
    .data(circles)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(Number(d.obesity)))
    .attr("cy", (d) => yScale(d.dpm))
    .attr("r", 4)

    .on("mouseover", function () {
      d3.select(this)
        .attr("r", 7)
        .attr('fill', 'red')
      tooltip
        .transition()
        .duration(1000)
        .style("opacity", "0")
    })

    .on("mouseout", function (d) {
      d3.select(this).transition()
        .duration('200')
        .attr("r", 4)
        .attr('fill', 'black')

      tooltip
        .transition()
        .duration(1000)
        .style("opacity", "0")
    })

    .on("mousemove", function (event, d) {
      d3.select(this).transition()
        .duration('100')
        .attr("r", 7)
        .attr('fill', 'red')

      let html = "<strong>Country: </strong>" + d.country + "<br><strong>Covid Deaths/Million: </strong>" + d.dpm + "<br> <strong>Obesity: </strong>" + d.obesity + "%<br>"

      tooltip
        .html(html)
        .transition()
        .duration(200)
        .style("opacity", "1")
    });

  tooltip = d3.select("#tooltip")
    .style('position', 'fixed')
    .style("top", 90 + "px")
    .style("left", 750 + "px")
    .style('background-color', 'lightgrey')
    .style('border', '3px solid red')
    .style('padding', '3px')
    .style('opacity', '0')
}


load()