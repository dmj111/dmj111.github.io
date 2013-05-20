let gaussPrev = null;

// Generate a random normal with mean 0, std 1.
function gauss()
{
    // http://c-faq.com/lib/gaussian.html
    let X;
    // This method generates two values at a time, so we are
    // keeping one around in a variable every other turn.

    if(gaussPrev !== null) {
        X = gaussPrev;
        gaussPrev = null;
    } else {
        for(;;) {
            const U1 = Math.random(),
                  U2 = Math.random(),
                  V1 = 2 * U1 - 1,
                  V2 = 2* U2 - 1,
                  S = V1 * V1 + V2 * V2;
            if(S > 0 && S < 1) {
                const m = Math.sqrt(-2 * Math.log(S) / S);
                X = V1 * m;
                gaussPrev = V2 * m;
                break;
            }
        }
    }
    return X;
}


// Taken very literally from
// http://rawrjustin.github.io/blog/2014/03/18/julia-vs-python-monte-carlo-simulations-of-bitcoin-options/
// and he gives credit to
// http://www.hilpisch.com/YH_Derivatives_Analytics_with_Python.html

// Parameters
var S0 = 600; //  current bitcoin price
var r = 0.02; // risk neutral payoff, assumed 2% for this exercise, in reality probably less.
var sigma = 2; // extremely high sigma due to spike in bitcoin prices late last year
var T = 1.0; // 1 Time cycle
var M = 100; // 100 steps
var dt = T / M; // dt

// Simulating I paths with M time steps
function genS_js(I) {
    //initialize array to hold all of our paths
    var S = [];
    // # for each path i to I
    var i;
    var a = Math.exp((r - 0.5 * sigma * sigma) * dt);
    var b = sigma * Math.sqrt(dt);
    for(i = 0; i < I; i += 1) {
        var path = [];
        // for each step t to M + 1
        path[0] = S0;
        for(var t = 1; t < M + 1; t += 1) {
            // take a random normally distributed number z (mean = 0, std = 1)
            // and append it to our current path
            var z = gauss();
            // var St = path[t-1] * a * Math.exp(b * z);

            var St = path[t - 1] *
                Math.exp((r - 0.5 * sigma * sigma) * dt + sigma *
                         Math.sqrt(dt) * z);
            path.push(St);
        }
        S.push(path);
    }
    return S;
}

function optionValuation(S) {
    var K = 1000.0,
        I = S.length;
    var i, sum = 0;
    for(i = 0; i < I; i += 1) {
        var path = S[i];
        sum += Math.max(0, path[path.length - 1] - K);
    }
    var C0 = Math.exp(-r * T) * sum / I;
    return C0;
}

export {gauss, genS_js, optionValuation};
