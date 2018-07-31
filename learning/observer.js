class Observer  {
    constructor (obj) {
        this.data = {};
        Object.keys(obj).forEach(k => {
            Object.defineProperty(this.data, k, {
                get: function () {
                    console.log(`你访问了${k}`);
                    return this.data['_' + k];
                }.bind(this),
                set: function (v) {
                    console.log(`你设置了${k},它的值为${v}`);
                    this.data['_' + k] = v;
                }.bind(this)
            });
        });
        return this;
    }
};
let app1 = new Observer({
    name: 'youngwind',
    age: 25
});
let app2 = new Observer({
    university: 'bupt',
    major: 'computer'
});
  
app1.data.name;
app1.data.age = 100;
app2.data.university;
app2.data.major = 'science';
