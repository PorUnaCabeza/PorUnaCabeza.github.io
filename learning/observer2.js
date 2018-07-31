class Observer  {
    constructor (obj) {
        this.data = this.buildObv(obj);
        return this;
    }
    buildObv (obj) {
        let data = {};
        Object.keys(obj).forEach(k => {
            Object.defineProperty(data, k, {
                get: function () {
                    console.log(`你访问了${k}`);
                    return data['_' + k];
                },
                set: function (v) {
                    if (typeof v == 'object') {
                        data['_' + k] = this.buildObv(v);
                    } else {
                        console.log(`你设置了${k},它的值为${v}`);
                        data['_' + k] = v;
                    }
                }.bind(this)
            });
        });
        return data;
    }
    $watch (k, cb) {
        
    }
};
let app1 = new Observer({
    name: 'youngwind',
    age: 25
});

app1.data.name = {
    lastName: 'liang',
    firstName: 'shaofeng'
};

app1.data.name.lastName;
app1.data.name.firstName = 'lalala';