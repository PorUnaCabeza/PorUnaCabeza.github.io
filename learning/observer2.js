class Observer  {
    constructor (obj) {
        this.data = this.buildObv(obj);
        this.watch = {};
        return this;
    }
    buildObv (obj) {
        let data = {};
        for (let k in obj) {
            if (!obj.hasOwnProperty(k)) 
                continue;
            data['_' + k] = obj[k];
            Object.defineProperty(data, k, {
                configurable: true,
                enumerable: true,
                get: function () {
                    console.log(`你访问了${k}`);
                    return data['_' + k];
                },
                set: function (v) {
                    this.$dispatch(k, v);
                    if (data['_' + k] === v)
                        return;
                    if (typeof v == 'object') {
                        data['_' + k] = this.buildObv(v);
                    } else {
                        console.log(`你设置了${k},它的值为${v}`);
                        data['_' + k] = v;
                    }
                }.bind(this)
            });
        }
        return data;
    }
    $watch (k, cb) {
        if (!cb instanceof Function)
            return;
        if (!this.watch[k])
            this.watch[k] = [cb];
        else
            this.watch[k].push(cb);
    }
    $dispatch (k, v) {
        let arr = this.watch[k];
        if (!arr)
            return;
        arr.forEach(cb => {
            cb(v);
        });
    }
};
let app1 = new Observer({
    name: 'youngwind',
    age: 25
});

app1.$watch('name', function (v) {
    console.log('呵呵呵' + v);
});
app1.$watch('name', function (v) {
    console.log('咳咳咳' + v);
});

app1.data.name = {
    lastName: 'liang',
    firstName: 'shaofeng'
};

app1.data.name.firstName = 'lalala';
app1.data.name.lastName;