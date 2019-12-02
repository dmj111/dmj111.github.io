// Run this system sort.

let output = null;
let table = null;

function sys(xs) {
    xs.sort((a, b) => {
        return a - b;
    });
    return xs;
}


function add_row(table, elements, tag) {
    const row = document.createElement('tr');
    elements.forEach((val) => {
        const e = document.createElement(tag);
        e.innerText = val;
        row.appendChild(e);
    });
    table.appendChild(row);
}



// Log messages to the output pre and to the console.
function log(txt) {
    console.log(txt);
    output.innerHTML += txt + '\n';
}

// Time fcn, using setup before the function, and check to verify
// the results.  Repeat.

function time(fcn, repeats=1, setup=false, check=false) {
    const times = [];
    let state;
    for(let i = 0; i < repeats; i += 1) {
        if(setup) {
            state = setup();
        }
        const start = new Date();
        const r = fcn(state);
        const end = new Date();
        if(check) {
            check(r);
        }
        times.push((end-start) / 1000);
        log('took :' + times[times.length - 1]);
    }
    const stats = calcStats(times);
    log('mean: ' + stats.mean + ' std: ' + stats.std);
    return stats;
}

// Find the mean and standard deviation of an array.
function calcStats(xs) {
    let m = 0,
        ssq = 0;
    for(let i = 0; i < xs.length; i += 1) {
        m += (xs[i] - m) / (i + 1);
    }
    for(let i = 0; i < xs.length; i += 1) {
        ssq += Math.pow(xs[i] - m, 2);
    }
    return {mean: m, std: Math.sqrt(ssq / (xs.length - 1))};
}


// Given a sort function and data to sort, run the timer on it.
// On each iteration, copy the data to a new array.
function runTest(sortfcn, data, repeats, data_name) {
    function check(xs) {
        for(let i = 1; i < xs.length; i += 1) {
            if(xs[i] < xs[i-1]) {
                throw 'failed';
            }
        }
    }

    function setup() {
        return data.slice();
    }

    log('running function: ' + sortfcn.name);
    let mean;
    try {
        const stats = time(sortfcn, repeats, setup,  check);
        mean = stats.mean;
    } catch(error) {
        console.error(error);
        log("FAILURE");
        mean = NaN;
    }
    add_row(table, [sortfcn.name, data_name, mean.toFixed(3)], "td");
}

// Insertion sort on part of an array.
function isort(xs, start, end) {
    for(let a = start; a < end; a += 1) {
        const t = xs[a];
        let b = a;
        for(; b > start && xs[b-1] > t; b -= 1) {
            xs[b] = xs[b-1];
        }
        xs[b] = t;
    }
    return xs;
}

const INSERT_SORT_THRESHOLD = 20;

// Return the median of the three values.
function medianOfThree(a, b, c) {
    if(a < b) {
        if(b < c) {
            return b;
        } else if (a < c) {
            return c;
        } else {
            return a;
        }
    } else {
        if(a < c) {
            return a;
        } else if (b < c) {
            return c;
        } else {
            return b;
        }
    }
}

// Simple quick sort, median of three pivots, uses < for
// comparison.
//QSORT1START
function qsort1(xs, start, end) {
    start = start || 0;
    if(end === undefined) { end = xs.length;}

    if(end < start + INSERT_SORT_THRESHOLD) {
        isort(xs, start, end);
        return xs;
    }

    let i = start - 1,
        j = end;
        // pidx = Math.floor(Math.random() * (end - start)) + start,

    const pivot = medianOfThree(xs[start],
                                xs[Math.floor((start + end) / 2)],
                                xs[end-1]);
    while(i < j) {
        i += 1;
        while(i < j && xs[i] < pivot) {
            i += 1;
        }

        j -= 1;
        while(i < j && pivot < xs[j]) {
            j -= 1;
        }

        if(i < j) {
            const t = xs[i];
            xs[i] = xs[j]; xs[j] = t;
        }
    }
    if(xs[i] < pivot) { throw 'invariant'; }

    qsort1(xs, start, i);
    qsort1(xs, i, end);
    return xs;
}
//QSORT1END

// Simple quick sort, median of three pivots, uses < for
// comparison.  Uses fat partitioning.
//QSORT2START
function qsort2(xs) {
    sort(xs, 0, xs.length);
    return xs;

    // The actual sort body.
    function sort(xs, start, end) {
        if(end < start + INSERT_SORT_THRESHOLD ) {
            isort(xs, start, end);
            return;
        }

        let i = start - 1,
            j = end,
            u = i,
            v = j;
        const pivot = medianOfThree(xs[start],
                                    xs[Math.floor((start + end) / 2)],
                                    xs[end-1]);
        // Reorder the values, and maintain the indices so we have
        // the following:
        //
        // begin (inclusive)  |  end (exclusive)  |   description
        // start              |  u                |   == pivot
        // u                  |  i                |    < pivot
        // i                  |  v                |    > pivot
        // v                  |  end              |    = pivot

        while(i < j) {
            i += 1;
            while(i < j && xs[i] < pivot) {
                i += 1;
            }

            j -= 1;
            while(i < j && pivot < xs[j]) {
                j -= 1;
            }

            if(i < j) {
                const t = xs[i];
                xs[i] = xs[j]; xs[j] = t;
                /* jshint ignore:start */
                // We are ignoring the !.  Just trying to stick
                // with < for now...
                if(!(xs[i] < pivot)) {
                    u += 1;
                    const t = xs[i];
                    xs[i] = xs[u]; xs[u] = t;
                }
                if( !(pivot < xs[j])) {
                    v -= 1;
                    const t = xs[j];
                    xs[j] = xs[v]; xs[v] = t;
                }
                /* jshint ignore:end */
            }
        }

        // if(xs[i] < pivot) { throw 'invariant'; }

        // Now, 'flip' the sides around to bring the values equal
        // to the pivot to the middle.

        j = vecswap(xs, i, v, end);
        i = vecswap(xs, start, u + 1, i);

        // xs[i] >= pivot.
        sort(xs, start, i);
        sort(xs, j, end);
    }
}
//QSORT2END

// Shuffle the values such that all values originally in the range
//  [a, b) are now in the range [result, c), and all values
//  originally in [b, c) are now in [a, result).
//
// return result.

function vecswap(xs, a, b, c) {
    const n = Math.min(b-a, c-b);
    for(let j = c - n, i = a; j < c; j += 1, i += 1) {
        const t = xs[i];
        xs[i] = xs[j]; xs[j] = t;
    }
    return a + (c - b);
}

//
// Data generation functions
//

function shuffled(N) {
    return () => {
        const result = [];
        for(let i = 0; i < N; i += 1) {
            result[i] = i;
        }
        for(let i = 0; i < N; i += 1) {
            const j = Math.floor(Math.random() * i);
            const t = result[i];
            result[i] = result[j]; result[j] = t;
        }
        return result;
    };
}

function random(N) {
    return () => {
        const result = [];
        for(let i = 0; i < N; i += 1) {
            result[i] = Math.random();
        }
        return result;
    };
}

function sawtooth(N, M) {
    return () => {
        const result = [];
        for(let i = 0; i < N; i += 1) {
            result[i] = i % M;
        }
        return result;
    };
}

function scatter(N, M) {
    return () => {
        const result = [];
        for(let i = 0; i < N; i += 1) {
            result[i] = (i * M + i) % N;
        }
        return result;
    };
}


function ordered(N) {
    return () => {
        const result = [];
        for(let i = 0; i < N; i += 1) {
            result[i] = i;
        }
        return result;
    };
}

function reversed(N) {
    return () => {
        const result = [];
        for(let i = 0; i < N; i += 1) {
            result[i] = N - i;
        }
        return result;
    };
}

function run_timing_tests() {
    // Setup asynchronous execution so stuff shows up on the browser
    // quicker.
    // Grab the results div and setup an output pre.
    const results = document.getElementById('results');
    output = document.createElement('pre');
    table = document.createElement('table');
    results.appendChild(table);
    results.appendChild(output);

    add_row(table, ["data", "fcn", "mean"], "th");
    const queue = [];

    // Run the first value in the queue, if any.
    function runQueue() {
        if(queue.length) {
            const f = queue.shift();
            window.setTimeout(() => {
                f();
                runQueue();
            }, 50);
        }
    }

    const repeats = 5;

    queue.push(function () {
    log('warmup...');
        const data = sawtooth(2000, 4)();
        runTest(qsort2, data, repeats, "warmup");
    });

    queue.push(function() {
        log('\nscatter');

        const data = scatter(1000000, 10)();
        runTest(qsort2, data, repeats, "scatter");
        runTest(qsort1, data, repeats, "scatter");
        runTest(sys, data, repeats, "scatter");
    });

    queue.push(function (){
        log('\nrandom');
        const data = random(1000000)();
        runTest(qsort2, data, repeats, "random");
        runTest(qsort1, data, repeats, "random");
        runTest(sys, data, repeats, "random");
    });


    queue.push(function() {
        log('\nsawtooth');

        const data = sawtooth(1000000, 2)();
        runTest(qsort2, data, repeats, "sawtooth");
        runTest(qsort1, data, repeats, "sawtooth");
        runTest(sys, data, repeats, "sawtooth");
    });

    queue.push(function () {


        log('\nordered');
        const data = ordered(1000000, 10)();
        runTest(qsort2, data, repeats, "ordered");
        runTest(qsort1, data, repeats, "ordered");
        runTest(sys, data, repeats, "ordered");
    });

    queue.push(function() {
        log('\nreversed');

        const data = reversed(1000000, 10)();
        runTest(qsort2, data, repeats, "reversed");
        runTest(qsort1, data, repeats, "reversed");
        runTest(sys, data, repeats, "reversed");
    });

    queue.push(function () {
        log('\nshuffled');
        const data = shuffled(1000000)();
        runTest(qsort2, data, repeats, "shuffled");
        runTest(qsort1, data, repeats, "shuffled");
        runTest(sys, data, repeats, "shuffled");
    });
    // start it up!
    runQueue();
}

export {run_timing_tests};
