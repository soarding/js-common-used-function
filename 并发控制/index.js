class concurrentPoll {
    constructor(max) {
        this.count = 0
        this.tasks = []
        this.max = max
        setTimeout(() => {
            this.run()
        }, 0)
    }

    addTask(time, value) {
        this.tasks.push(() => new Promise((done) => {setTimeout(() => done(value), time)}))
    }

    run() {
        if(this.tasks.length === 0 || this.count === this.max) {
            return
        }
        let min = Math.min(this.tasks.length, this.max - this.count)
        while(min--) {
            this.count++
            let task = this.tasks.shift()
            task().then(value => console.log(value)).catch(err => console.log(err)).finally(() => {
                this.count--
                this.run()
            })
        }
    }
}
const poll = new concurrentPoll(2); // 实例  

poll.addTask(1000, '1')
poll.addTask(500, '2')
poll.addTask(300, '3')
poll.addTask(400, '4')