/* Shinto */

if (typeof spirals === "undefined") {
    var spirals = {};
    window.onload = function() {
        spirals = (function() {
            var sp = {},
                angle_a = 0,  //
                angle_b = 0,
                a = 100,
                b = 70,
                a_delta = 120,
                b_delta = 30,
                active = true;

            function setup() {
                sp.output = document.getElementById("output");

                // Create canvas elements
                sp.canvas = document.createElement("canvas");
                sp.ctx = sp.canvas.getContext("2d");
                sp.output.appendChild(sp.canvas);

                // This one is relative to hold space in the div.
                sp.canvas.style.position = "relative";
                sp.canvas.style.top = 0;
                sp.canvas.style.left = 0;
                sp.background = "#ddd";

                // This one is absolute to put it on top of the other one.
                sp.overlay = document.createElement("canvas");
                sp.octx = sp.overlay.getContext("2d");
                sp.output.appendChild(sp.overlay);
                sp.overlay.style.position = "absolute";
                sp.overlay.style.top = 0;
                sp.overlay.style.left = 0;
                sp.background = "#ddd";
                sp.overlay.style.backgroundColor = "rgba(0,0,0,0";
                sp.resize(0.8*Math.min(window.innerHeight, window.innerWidth));


                sp.ctx.lineWidth = 2;
                sp.ctx.strokeStyle="black";
                sp.angle_a = 0;
                sp.angle_b = 0;

                sp.rate = 2;
                sp.delta = 0.04/100;

            }

            sp.resize = function(m) {
                sp.canvas.width = m;
                sp.canvas.height = m;
                sp.overlay.width = m;
                sp.overlay.height = m;
                a = m / 2.4 / 2;
                b = a * 0.7;
                sp.clear();
            },

            sp.clear = function() {
                sp.canvas.style.backgroundColor = sp.background;
                sp.ctx.clearRect(0, 0, sp.canvas.width,
                                 sp.canvas.height);
            };

            sp.pos = function() {
                return {ax: Math.cos(angle_a) * a,
                        ay: Math.sin(angle_a) * a,
                        bx: Math.cos(angle_b) * b,
                        by: Math.sin(angle_b) * b};
            },

            sp.draw = function () {
                var i = 0, p, m = sp.canvas.width / 2;
                if(active) {
                    sp.ctx.save();
                    sp.ctx.translate(m, m);
                    p = sp.pos();
                    sp.ctx.beginPath();
                    sp.ctx.moveTo(p.ax + p.bx, p.ay + p.by);
                    for(i = 0; i < sp.rate; i += 1) {
                        angle_a += sp.delta * a_delta;
                        angle_b += sp.delta * b_delta;
                        p = sp.pos();
                        sp.ctx.lineTo(p.ax + p.bx, p.ay + p.by);
                    }
                    sp.ctx.stroke();
                    sp.ctx.restore();
                    angle_a = angle_a % (2*Math.PI);
                    angle_b = angle_b % (2*Math.PI);
                }
                p = sp.pos();
                sp.octx.save();
                sp.overlay.width = sp.overlay.width;
                sp.octx.strokeStyle = "#888888";
                sp.octx.lineWidth = 3;
                sp.octx.translate(m, m);
                sp.octx.beginPath();
                sp.octx.moveTo(0, 0);
                sp.octx.lineTo(p.ax, p.ay);
                sp.octx.translate(p.ax, p.ay);
                sp.octx.lineTo(p.bx, p.by);
                sp.octx.stroke();
                sp.octx.translate(p.bx, p.by);

                sp.octx.beginPath();
                sp.octx.arc(0, 0, 5, 0, 6.3);
                sp.octx.fill();
                sp.octx.restore();

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






            function setup_gui() {
                var a_elem = document.getElementById("a");
                var b_elem = document.getElementById("b");
                var a_rate_elem = document.getElementById("a_rate");
                var b_rate_elem = document.getElementById("b_rate");
                var color_elem = document.getElementById("color");
                var state_elem = document.getElementById("state");
                var img_elem = document.getElementById("image");

                function update() {
                    var ta = parseFloat(a_elem.value),
                        tb = parseFloat(b_elem.value),
                        tb_rate = parseFloat(b_rate_elem.value),
                        ta_rate = parseFloat(a_rate_elem.value),
                        color = color_elem.value;
                    if(!isNaN(ta)) { a = ta; }
                    if(!isNaN(tb)) { b = tb; }
                    if(!isNaN(tb_rate)) { b_delta = tb_rate; }
                    if(!isNaN(ta_rate)) { a_delta = ta_rate; }
                    sp.ctx.strokeStyle=color;

                }
                document.getElementById("clear").addEventListener(
                    "click", function() {
                        update();
                        sp.clear();
                    }, false);

                b_elem.onchange = update;
                a_elem.onchange = update;
                a_rate_elem.onchange = update;
                b_rate_elem.onchange = update;
                color_elem.onchange = update;

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
                update();

            }
            setup();

            setup_gui();
            sp.interval = setInterval(sp.draw, 1000/30);

            return sp;

        }());

    };
}
