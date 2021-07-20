const educationURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json'

const countyURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'

let countyData
let educationData

let svg = d3.select('#svg')

let tooltip = d3.select('#tooltip')

let usMap = () => {
  svg.selectAll('path')
    .data(countyData)
    .enter()
    .append('path')
    .attr('d', d3.geoPath())
    .attr('class', 'county')
    .attr('fill', d => colorSelection(d))
    .attr('id', d => d.id)
    .attr('data-education', (d) => {
      for (let i = 0; i < educationData.length; i++) {
        if (educationData[i]['fips'] === d.id) {
          return educationData[i]['bachelorsOrHigher']
        }
      }
    })
    .attr('state', (d) => {
      for (let i = 0; i < educationData.length; i++) {
        if (educationData[i]['fips'] === d.id) {
          return educationData[i]['state']
        }
      }
    })
    .attr('county-name', (d) => {
      for (let i = 0; i < educationData.length; i++) {
        if (educationData[i]['fips'] === d.id) {
          return educationData[i]['area_name']
        }
      }
    })

    .on('mouseover', function () {
      tooltip.style('display', null)
    })
    .on('mouseout', function (d) {
      d3.select('[id="' + d.srcElement.id + '"]').attr('fill', colorSelection(d.srcElement))
      tooltip.style('display', 'none')
    })
    .on('mousemove', function (d) {
      d3.select('[id="' + d.srcElement.id + '"]').attr('fill', 'pink')

      let percentage = d['srcElement']['attributes']['data-education']['value']
      let state = d['srcElement']['attributes']['state']['value']
      let county = d['srcElement']['attributes']['county-name']['value']

      let show = state + ', ' + county + ': ' + percentage + '%'
      tooltip.select('text').text(show)
      tooltip.append('text')
      tooltip.attr('data-education', show)
    })
}

function colorSelection(d) {
  let id = d['id']
  for (let i = 0; i < educationData.length; i++) {
    if (educationData[i]['fips'] == id) {
      if (educationData[i]['bachelorsOrHigher'] < 15) {
        return 'white'
      } else if (educationData[i]['bachelorsOrHigher'] < 35) {
        return 'lightblue'
      } else if (educationData[i]['bachelorsOrHigher'] < 50) {
        return 'blue'
      } else {
        return 'darkblue'
      }
    }
  }
}

d3.json(countyURL)
  .then((data, error) => {
    if (error) {
      console.log(error)
    } else {
      countyData = topojson.feature(data, data.objects.counties).features
      d3.json(educationURL).then(
        (data, error) => {
          if (error) {
            console.log(error)
          } else {
            educationData = data
            usMap()
          }
        })
    }
  })