class Presentational extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      break: 5,
      session: 25,
      time: 25,
      start: false,
      mode: 'Session',
      audio: false
    }
    this.incrementB = this.incrementB.bind(this)
    this.decrementB = this.decrementB.bind(this)
    this.incrementS = this.incrementS.bind(this)
    this.decrementS = this.decrementS.bind(this)
    this.reset = this.reset.bind(this)
    this.runTimer = this.runTimer.bind(this)
    this.countdown = this.countdown.bind(this)
    this.stopCountdown = this.stopCountdown.bind(this)
    this.startCountdown = this.startCountdown.bind(this)
    this.clock = this.clock.bind(this)
  }

  incrementB() {
    if (this.state.break < 60) {
      this.setState((state) => ({
        break: state.break + 1
      }))
    }

  }

  decrementB() {
    if (this.state.break > 1) {
      this.setState((state) => ({
        break: state.break - 1
      }))
    }

  }

  incrementS() {
    if (this.state.session < 60) {
      this.setState((state) => ({
        session: state.session + 1,
        time: state.time + 1
      }))
    }
  }

  decrementS() {
    if (this.state.session > 1) {
      this.setState((state) => ({
        session: state.session - 1,
        time: state.time - 1,
        minutes: state.time - 1,
        seconds: '00'
      }))
    }
  }

  reset() {
    this.setState({
      break: 5,
      session: 25,
      time: 25,
      start: false,
      mode: 'Session'
    })
    this.stopCountdown()
    let audio = document.getElementById('beep');
    audio.pause()
    audio.currentTime = 0
  }

  runTimer() {
    if (this.state.start) {
      this.stopCountdown()
    }

    else {
      this.startCountdown()
    }
  }

  countdown() {
    if ((Math.floor(this.state.time * 60)) > 0) {
      this.setState((state) => ({
        time: ((state.time * 60) - 1) / 60
      }))
    }
    else if (this.state.mode == 'Session') {
      this.setState((state) => ({
        mode: 'Break',
        time: state.break
      }))
    } else {
      this.setState({
        mode: 'Session',
        time: this.state.session
      })
    }

    if (Math.floor(this.state.time * 60) == 0) {
      document.getElementById('beep').play()
    }
  }

  stopCountdown() {
    clearInterval(this.intervalID)
    this.setState({
      start: false
    })
  }

  startCountdown() {
    this.intervalID = setInterval(this.countdown, 1000)
    this.setState({
      start: true
    })
  }

  clock() {
    let minutes = Math.floor(this.state.time);
    let seconds = Math.round((this.state.time - Math.floor(this.state.time)) * 60);
    if (seconds < 10) {
      seconds = "0" + seconds
    }
    if (minutes < 10) {
      minutes = '0' + minutes
    }
    return minutes + ':' + seconds
  }

  render() {
    return (
      <div>
        <h1 id='name'>Pomodoro Clock</h1>

        <div id='adjustable'>

          <div id='break' class='col-xs-6'>
            <button id='break-increment' class='increment-button' onClick={this.incrementB}>Increase</button>
            <button id='break-decrement' class='decrement-button' onClick={this.decrementB}>Decrease</button>
            <div id='break-label'>
              Break Length:
              <p id='break-length' class='center'><strong>{this.state.break}</strong></p>
            </div>
          </div>

          <div id='session' class='col-xs-6'>
            <button id='session-increment' class='increment-button' onClick={this.incrementS}>Increase</button>
            <button id='session-decrement' class='decrement-button' onClick={this.decrementS}>Decrease</button>

            <div id='session-label'>
              Session Length:
              <p id='session-length' class='center'><strong>{this.state.session}</strong></p>
            </div>
          </div>

          <div i='actual-timer'>
            <h2 id='timer-label'>{this.state.mode}</h2>
            <h3 id='time-left'>{this.clock()}</h3>
          </div>

          <div id='interaction'>
            <button id='start_stop' onClick={this.runTimer}>
              Play/Pause</button>
            <button id='reset' onClick={this.reset}>Reset</button>
          </div>

        </div>
      </div>

    )
  }
}

ReactDOM.render(<Presentational />, document.getElementById('pomodoro'))