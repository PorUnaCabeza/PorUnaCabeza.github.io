function Ball () {}
Ball.prototype = {
    setWeight: function (w) {
        this.weight = w;
    },
    getWeight: function () {
        console.log(this.weight);
        return this.weight;
    },
    setPeople: function (p) {
        this.people = p;
    },
    getPeople: function () {
        console.log(this.people);
        return this.people;
    },
    setHistory: function (h) {
        this.history = h;
    },
    getHistory: function () {
        console.log(this.history);
        return this.history;
    }
};
function FootBall (p) {
    this.people = p;
}
function BasketBall (p) {
    this.people = p;
}
FootBall.prototype = new Ball();
BasketBall.prototype = new Ball();
var footBall = new FootBall();
footBall.setWeight('10kg');
footBall.setPeople(12);
footBall.setHistory('足球起源于英国');

footBall.getWeight(); // 10kg
footBall.getPeople(); // 12;
footBall.getHistory(); //足球起源于英国
var basketBall = new BasketBall();
basketBall.setWeight('12kg');
basketBall.setPeople(10);
basketBall.setHistory('篮球很大');

basketBall.getWeight(); // 12kg
basketBall.getPeople(); // 10;
basketBall.getHistory(); //篮球很大

function Sports (type) {
    if (type == 'footBall')
        return new FootBall(12);
    else if (type == 'basketBall')
        return new BasketBall(10);
};
var sports1 = new Sports('footBall');
sports1.getPeople() // 12
var sports2 = new Sports('basketBall');
sports2.getPeople() // 10