/* jshint */


function clear(canvas, context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
}


class Spirals {
    constructor() {
        this.a = 0;
        this.b = 0;
        this.c = 0;
    }

    start() {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.output = document.getElementById("output");
        this.output.appendChild(this.canvas);
        this.canvas.width = 500;
        this.canvas.height = 500;
        this.output.style.height = this.canvas.height;
        this.canvas.style.position = "relative";
        this.canvas.style.top = 0;
        this.canvas.style.left = 0;
        this.background = "#ddd";
        this.canvas.style.backgroundColor = this.background;

        this.overlay = document.createElement("canvas");
        this.output.appendChild(this.overlay);
        this.octx = this.overlay.getContext("2d");
        this.overlay.width = 500;
        this.overlay.height = 500;
        this.output.appendChild(this.overlay);
        this.overlay.style.position = "absolute";
        this.overlay.style.top = 0;
        this.overlay.style.left = 0;
        this.background = "#ddd";
        this.overlay.style.backgroundColor = "rgba(0,0,0,0)";

        this.resize();
        this.interval = setInterval(() => this.draw(), 1000/30);

        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle="black";
        this.angle_a = 0;
        this.angle_b = 0;
        this.rate = 2;
        this.delta = 0.04;
        // a = this.radius;
        this.b = 0.91;
        this.c = 0.9;
        this.add_callbacks();
    }

    resize() {
        const m = Math.min(window.innerHeight, window.innerWidth) * 0.8;
        this.radius = m / 2.4;
        this.canvas.width = m;
        this.canvas.height = m;
        this.overlay.width = m;
        this.overlay.height = m;
        this.output.style.height = m;
        this.a = this.radius;
    }

    clear() {
        clear(this.canvas, this.ctx);
    }

    pos() {
        const a = this.a,
              b = this.b,
              c = this.c,
              m = this.canvas.width / 2,
              ax = Math.cos(this.angle_a) * (a - a*b) + m,
              ay = Math.sin(this.angle_a) * (a - a*b) + m,
              x = ax + c * a * b * Math.cos(this.angle_b),
              y = ay - c * a * b * Math.sin(this.angle_b),
              bx = ax + a * b * Math.cos(this.angle_b),
              by = ay -  a * b * Math.sin(this.angle_b);
        return {x: x, y: y, ax: ax, ay: ay, bx: bx, by: by, m: m};
    }

    draw() {
        let p = this.pos();
        for(let i = 0; i < this.rate; i += 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.angle_a += this.delta;
            this.angle_b += this.delta / this.b;
            p = this.pos();
            this.ctx.lineTo(p.x, p.y);
            this.ctx.stroke();
        }
        this.angle_a = this.angle_a % (2*Math.PI);
        this.angle_b = this.angle_b % (2*Math.PI);

        clear(this.overlay, this.octx);

        this.octx.strokeStyle = "#888888";
        this.octx.lineWidth = 3;
        this.octx.beginPath();
        this.octx.arc(p.m, p.m, this.a, 0, 6.3);
        this.octx.stroke();

        this.octx.beginPath();
        this.octx.arc(p.ax, p.ay, this.b * this.a, 0, 6.3);
        this.octx.stroke();
        this.octx.beginPath();
        this.octx.moveTo(p.m, p.m);
        this.octx.lineTo(p.ax, p.ay);
        this.octx.stroke();
        this.octx.beginPath();
        this.octx.moveTo(p.ax, p.ay);
        this.octx.lineTo(p.bx, p.by);
        this.octx.stroke();

        this.octx.beginPath();
        this.octx.moveTo(p.ax, p.ay);
        this.octx.lineTo(p.x, p.y);
        this.octx.stroke();

        this.octx.beginPath();
        this.octx.arc(p.x, p.y, 5, 0, 6.3);
        this.octx.fill();
    }

    add_callbacks() {
        const b_elem = document.getElementById("b");
        const c_elem = document.getElementById("c");
        const color_elem = document.getElementById("color");
        const state_elem = document.getElementById("state");

        document.getElementById("clear").addEventListener(
            "click", () => {
                const tb = parseFloat(b_elem.value),
                      tc = parseFloat(c_elem.value),
                      color = color_elem.value;
                if(!isNaN(tb)) { this.b = tb; }
                if(!isNaN(tc)) { this.c = tc; }
                this.ctx.strokeStyle=color;
                this.clear();
            }, false);

        b_elem.onchange = () => {
            const tb = parseFloat(b_elem.value);
            if(!isNaN(tb)) { this.b = tb; }
        };
        c_elem.onchange = () => {
            const tc = parseFloat(c_elem.value);
            if(!isNaN(tc)) { this.c = tc; }
        };

        color_elem.onchange = () => {
            const color = color_elem.value;
            this.ctx.strokeStyle=color;
        };

        state_elem.onclick = () => {
            if(this.interval) {
                clearInterval(this.interval);
                this.interval = undefined;
                state_elem.innerHTML = "Start";
            } else {
                this.interval = setInterval(() => this.draw(), 1000/30);
                state_elem.innerHTML = "Pause";
            }
        };

        document.getElementById("save").onclick = () => {
            const img_elem = document.getElementById("image-div");
            const img = document.createElement("img");
            img.setAttribute("src", this.canvas.toDataURL("image/png"));
            img_elem.insertBefore(img, img_elem.firstChild);
        };

        b_elem.onchange();
        c_elem.onchange();
        color_elem.onchange();
        this.clear();
    }
}


let spiral;

window.addEventListener('load', () => {
    spiral = new Spirals();
    spiral.start();
});
