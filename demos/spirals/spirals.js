/* jshint */

if (typeof spirals === "undefined") {
    var spirals = {};
    window.onload = function() {
        spirals = (function() {
            var sp = {};
            var angle_a = 0, angle_b = 0,a,b,c;

            sp.resize = function() {
                var m = Math.min(window.innerHeight, window.innerWidth) * 0.8;
                sp.radius = m / 2.4;
                sp.canvas.width = m;
                sp.canvas.height = m;
                sp.overlay.width = m;
                sp.overlay.height = m;
                sp.output.style.height = m;
                a = sp.radius;
            };

            sp.clear = function() {
                sp.ctx.clearRect(0, 0, sp.canvas.width,
                                 sp.canvas.height);
            };

            sp.pos = function() {
                var m = sp.canvas.width / 2,
                    ax = Math.cos(angle_a) * (a - a*b) + m,
                    ay = Math.sin(angle_a) * (a - a*b) + m,
                    x = ax + c * a * b * Math.cos(angle_b),
                    y = ay - c * a * b * Math.sin(angle_b),
                    bx = ax + a * b * Math.cos(angle_b),
                    by = ay -  a * b * Math.sin(angle_b);

                return {x: x, y: y, ax: ax, ay: ay, bx: bx, by: by};
            };

            sp.draw = function () {
                var i = 0, p, m = sp.canvas.width / 2;
                p = sp.pos();
                for(i = 0; i < sp.rate; i += 1) {
                    sp.ctx.beginPath();
                    sp.ctx.moveTo(p.x, p.y);
                    angle_a += sp.delta;
                    angle_b += sp.delta / b;
                    p = sp.pos();
                    sp.ctx.lineTo(p.x, p.y);
                    sp.ctx.stroke();
                }
                angle_a = angle_a % (2*Math.PI);
                angle_b = angle_b % (2*Math.PI);
                sp.overlay.width = sp.overlay.width;
                sp.octx.strokeStyle = "#888888";
                sp.octx.lineWidth = 3;
                sp.octx.beginPath();
                sp.octx.arc(m, m, a, 0, 6.3);
                sp.octx.stroke();

                sp.octx.beginPath();
                sp.octx.arc(p.ax, p.ay, b * a, 0, 6.3);
                sp.octx.stroke();
                sp.octx.beginPath();
                sp.octx.moveTo(m, m);
                sp.octx.lineTo(p.ax, p.ay);
                sp.octx.stroke();
                sp.octx.beginPath();
                sp.octx.moveTo(p.ax, p.ay);
                sp.octx.lineTo(p.bx, p.by);
                sp.octx.stroke();

                sp.octx.beginPath();
                sp.octx.moveTo(p.ax, p.ay);
                sp.octx.lineTo(p.x, p.y);
                sp.octx.stroke();

                sp.octx.beginPath();
                sp.octx.arc(p.x, p.y, 5, 0, 6.3);
                sp.octx.fill();


            };

            sp.set_b = function(n) {
                if (n > 0 && n <= 1) {
                    b = n;
                    sp.clear();
                }
            };
            sp.set_c = function(n) {
                if (n > 0 && n <= 2) {
                    c = n;
                    sp.clear();
                }
            };


            sp.canvas = document.createElement("canvas");
            sp.ctx = sp.canvas.getContext("2d");
            sp.output = document.getElementById("output");
            sp.output.appendChild(sp.canvas);
            sp.canvas.width = 500;
            sp.canvas.height = 500;
            sp.output.style.height = sp.canvas.height;
            sp.canvas.style.position = "relative";
            sp.canvas.style.top = 0;
            sp.canvas.style.left = 0;
            sp.background = "#ddd";
            sp.canvas.style.backgroundColor = sp.background;

            sp.overlay = document.createElement("canvas");
            sp.octx = sp.overlay.getContext("2d");
            sp.overlay.width = 500;
            sp.overlay.height = 500;
            sp.output.appendChild(sp.overlay);
            sp.overlay.style.position = "absolute";
            sp.overlay.style.top = 0;
            sp.overlay.style.left = 0;
            sp.background = "#ddd";
            sp.overlay.style.backgroundColor = "rgba(0,0,0,0)";


            sp.resize();



            sp.interval = setInterval(sp.draw, 1000/30);

            sp.ctx.lineWidth = 2;
            sp.ctx.strokeStyle="black";
            sp.angle_a = 0;
            sp.angle_b = 0;

            sp.rate = 2;
            sp.delta = 0.04;

            // a = sp.radius;
            b = 0.91;
            c = 0.9;


            var b_elem = document.getElementById("b");
            var c_elem = document.getElementById("c");
            var color_elem = document.getElementById("color");
            var state_elem = document.getElementById("state");
            var img_elem = document.getElementById("image");

            document.getElementById("clear").addEventListener(
                "click", function() {
                    var tb = parseFloat(b_elem.value),
                        tc = parseFloat(c_elem.value),
                        color = color_elem.value;
                    if(!isNaN(tb)) { b = tb; }
                    if(!isNaN(tc)) { c = tc; }
                    sp.ctx.strokeStyle=color;
                    sp.clear();
                }, false);

            b_elem.onchange = function() {
                var tb = parseFloat(b_elem.value);
                if(!isNaN(tb)) { b = tb; }
            };
            c_elem.onchange = function() {
                var tc = parseFloat(c_elem.value);
                if(!isNaN(tc)) { c = tc; }
            };

            color_elem.onchange = function() {
                var color = color_elem.value;
                sp.ctx.strokeStyle=color;
            };

            state_elem.onclick = function () {
                if(sp.interval) {
                    clearInterval(sp.interval);
                    sp.interval = undefined;
                    state_elem.innerHTML = "Start";
                } else {
                    sp.interval = setInterval(sp.draw, 1000/30);
                    state_elem.innerHTML = "Pause";
                }
            };

            document.getElementById("save").onclick = function() {
                img_elem.src = sp.canvas.toDataURL("image/png");
            };

            b_elem.onchange();
            c_elem.onchange();
            color_elem.onchange();
            sp.clear();
            return sp;

        }());

    };
}
