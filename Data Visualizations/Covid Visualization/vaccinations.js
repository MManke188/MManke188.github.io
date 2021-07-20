// Setting up the graph, axis, scales,...
graph = d3.select('#graph')
total_width = graph.style('width').slice(0, -2)
total_height = total_width * 0.5625
margins = {
  top: 50,
  left: 100,
  right: 20,
  bottom: 40
}
width = total_width - margins.left - margins.right
height = total_height - margins.top - margins.bottom

svg = graph.append('svg')
  .style('width', `${total_width}px`)
  .style('height', `${total_height}px`)
  .style('background-color', 'rgb(245, 245, 245)')
  .style('border', '1px solid #888')

g = svg.append('g')
  .attr('transform', `translate(${margins.left}, ${margins.top})`)
  .attr('width', width + 'px')
  .attr('height', height + 'px')


x = d3.scaleTime().range([0, width])
y = d3.scaleLinear().range([height, 0])

allCountries = ['United States', 'Canada', 'India', 'Brazil', 'United Kingdom', 'Germany', 'Italy', 'Israel', 'Russia']

xAxisCall = d3.axisBottom().tickFormat(d3.timeFormat("%b' %y"))
xAxis = g.append('g')
  .attr('transform', `translate(0, ${height})`)
yAxisCall = d3.axisLeft()
yAxis = g.append('g')

parser = d3.timeParse(d3.timeParse('%Y-%m-%d'))

let sorted

categoryScale = d3.scaleOrdinal().domain(['single-dose', 'fully-vaccinated', 'fully-vaccinated-ph'])
  .range(['people_vaccinated', 'people_fully_vaccinated', 'people_fully_vaccinated_per_hundred'])

colorScale = d3.scaleOrdinal().domain(allCountries).range(['blue', 'red', 'orange', 'green', 'violet', 'darkred', 'lightgreen', 'lightblue', 'pink'])

symbolScale = d3.scaleOrdinal().domain(['people_vaccinated', 'people_fully_vaccinated', 'people_fully_vaccinated_per_hundred']).range(['People Vaccinated', 'People Fully Vaccinated', '% Fully Vaccinated'])

function load() {
  // Getting the data:
  let covidData = 'https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.csv'

  d3.csv(covidData)
    .then((data, error) => {
      if (error) {
        console.log(error)
      } else {
        console.log('This is the data:')
        console.log(data)

        sorted = filter(data)
        console.log(sorted)

        load2('single-dose');
      }
    })
}

function filter(data) {
  // Preparing the data
  let entries = data.filter((country) => allCountries.indexOf(country.location) >= 0)

  filtered = d3.nest()
    .key((d) => d.location)
    .entries(entries);

  return filtered
}

function sort2(data, symbol) {
  data = Object.entries(data)
  let i = 1

  data.forEach((e, j) => {
    while (e[1][e[1].length - i][symbolScale(symbol)] == undefined && e[1][e[1].length - i][symbol] == undefined && i < e[1].length) {
      i++;
    }
    if (e[1][e[1].length - i][symbolScale(symbol)] !== undefined) {
      e[1][e[1].length - 1][symbol] = e[1][e[1].length - i][symbolScale(symbol)]
    } else {
      e[1][e[1].length - 1][symbol] = e[1][e[1].length - i][symbol]
    }
    i = 1
  })


  let sorted = data.sort((a, b) => {
    return b[1][b[1].length - 1][symbolScale(symbol)] - a[1][a[1].length - 1][symbolScale(symbol)]
  })
  return sorted
}

function load2(category) {
  let newCategory = categoryScale(category)
  let finalData = sorted

  x.domain([parser('2020-12-01'), parser('2021-05-20')])
  let max = 0
  finalData.forEach((country) => {
    country.values.forEach((day) => {
      //console.log(day[newCategory])
      if (Number(day[newCategory]) > max) {
        max = Number(day[newCategory])
      }
    })
  })

  finalData.forEach((country) => {
    for (let i = 0; i < country.values.length; i++) {
      if (country.values[i][newCategory] == '') {
        country.values[i][newCategory] = 0
        if (i > 0) {
          country.values[i][newCategory] = country.values[i - 1][newCategory]
        }
      }
    }
  })

  y.domain([0, max])
  xAxis.transition()
    .duration(500)
    .call(xAxisCall.scale(x))
  yAxis.transition()
    .duration(500)
    .call(yAxisCall.scale(y))
  render(finalData, newCategory)
}

function render(data, symbol) {
  // Selecting the tooltip
  let tooltip = d3.select('#tooltip').style('position', 'relative').style('left', '30px')

  //svg.style('background-color', backgroundColor(symbol))

  g.selectAll('.line').remove()

  for (let i = 0; i < data.length; i++) {
    g.append('path')
      .datum(data[i].values)
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke-width', 2)
      .transition()
      .duration(250)
      // Adding a smoother transition:
      .style('opacity', 0)
      .transition()
      .duration(10)
      .attr('stroke', colorScale(data[i].key)) //color(symbol)
      .attr('d', d3.line()
        .x(d => {
          return x(parser(d.date))
        })
        .y(d => y(d[symbol])))
      // Finishing the smooth transition:
      .transition()
      .duration(250)
      .style('opacity', 1)

    g
      .append("g")
      .selectAll("dot")
      .data(data[i].values)
      .enter()
      .append("circle")
      .attr('class', 'line')
      .attr("cx", function (d) { return x(parser(d.date)) })
      .attr("cy", function (d) { return y(d[symbol]) })
      .attr("r", 10)
      .attr('opacity', 0)
      .attr("fill", colorScale(data[i].key))//color(symbol)
      .on('mouseover', function () {

        tooltip.transition()
          .duration(100)
          .style('color', 'rgba(0, 0, 0, 1)')
          .style('background-color', () => {
            let color = d3.rgb(colorScale(data[i].key))
            color.opacity = 0.3
            return color
          })
      })
      .on('mouseout', function () {

        tooltip.transition()
          .duration(1000)
          .style('background-color', 'rgba(0, 0, 0, 0)')
          .style('color', 'rgba(0,0,0,0)')

      })
      .on('mousemove', function (event, d) {
        let date = String(d.date).slice(0, 15)
        let number = numberWithCommas(d[symbol])
        let cat = symbolScale(symbol)

        show = number + '<br>' + cat + ' in ' + d.location + '<br>' + date + '<br>'
        tooltip.select('text').html(show)
        tooltip.append('text')
          .attr('information', show)
          .attr('class', 'tooltip_text')
          .style('font-size', '25px')

        tooltip.style('height', '190px')
          .style('border-radius', '25px')
      })
  }

}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Make the page load before user selection:
load()