/* jshint strict: true, unused:true, undef:true, browser:true */
/* globals  console, document */

window.addEventListener('load', function(e) {
    'use strict';


    // Grab the results div and setup an output pre.
    var results = document.getElementById('results');
    var output = document.createElement('pre');
    results.appendChild(output);

    // Log messages to the output pre and to the console.
    function log(txt) {
        console.log(txt);
        output.innerHTML += txt + '\n';
    }

    // Time fcn, using setup before the function, and check to verify
    // the results.  Repeat.

    function time(fcn, repeats, setup, check) {
        repeats = repeats || 1;
        var i, start, end, times = [], state, r, stats;
        for(i = 0; i < repeats; i += 1) {
            if(setup) {
                state = setup();
            }
            start = new Date();
            r = fcn(state);
            end = new Date();
            if(check) {
                check(r);
            }
            times.push((end-start) / 1000);
            log('took :' + times[times.length - 1]);
        }
        stats = calcStats(times);
        log('mean: ' + stats.mean + ' std: ' + stats.std);
    }

    // Find the mean and standard deviation of an array.
    function calcStats(xs) {
        var i,
            m = 0,
            ssq = 0;
        for(i = 0; i < xs.length; i += 1) {
            m += (xs[i] - m) / (i + 1);
        }
        for(i = 0; i < xs.length; i += 1) {
            ssq += Math.pow(xs[i] - m, 2);
        }
        return {mean: m, std: Math.sqrt(ssq / (xs.length - 1))};
    }


    // Given a sort function and data to sort, run the timer on it.
    // On each iteration, copy the data to a new array.
    function runTest(sortfcn, data, repeats) {
        function check(xs) {
            var i;
            for(i = 1; i < xs.length; i += 1) {
                if(xs[i] < xs[i-1]) {
                    throw 'failed';
                }
            }
        }

        function setup() {
            return data.slice();
        }

        log('running function: ' + sortfcn.name);

        time(sortfcn, repeats, setup,  check);
    }

    // Insertion sort on part of an array.
    function isort(xs, start, end) {
        var a, b, t;
        for(a = start; a < end; a += 1) {
            t = xs[a];
            for(b = a; b > start && xs[b-1] > t; b -= 1) {
                xs[b] = xs[b-1];
            }
            xs[b] = t;
        }
        return xs;
    }

    var INSERT_SORT_THRESHOLD = 20;

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
    // comparison.  Uses fat partitioning.

    function qsort2(xs) {
        sort(xs, 0, xs.length);
        return xs;

        function sort(xs, start, end) {
            var idxs;
            if(end < start + INSERT_SORT_THRESHOLD ) {
                isort(xs, start, end);
            } else {
                idxs = qsort2Partition(xs, start, end);
                sort(xs, idxs.a, idxs.b);
                sort(xs, idxs.c, idxs.d);
            }
        }
    }
    //QMEDSTART
    function quickMedian(xs) {
        var N = xs.length,
            start = 0, end = N,
            middle = Math.floor(N/2),
            idxs;

        while(end - start > INSERT_SORT_THRESHOLD) {
            idxs = qsort2Partition(xs, start, end);

            if(idxs.b > middle) {
                // search left
                end = idxs.b;
            } else if (idxs.c < middle) {
                start = idxs.c;
            } else {
                // We have contained the element!
                break;
            }
        }

        isort(xs, start, end);
        if(middle < start || middle > end) {
            throw 'bug... partitioning failed';
        }
        return xs[middle];
    }
    //QMEDEND

    // Partition the data, return the new intervals to recurse on.
    function qsort2Partition(xs, start, end) {
        var i = start - 1,
            j = end,
            u = i,
            v = j,
            pivot = medianOfThree(xs[start],
                                  xs[Math.floor((start + end) / 2)],
                                  xs[end-1]),
            t;
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
                t = xs[i]; xs[i] = xs[j]; xs[j] = t;
                /* jshint ignore:start */
                // We are ignoring the !.  Just trying to stick
                // with < for now...
                if(!(xs[i] < pivot)) {
                    u += 1;
                    t = xs[i]; xs[i] = xs[u]; xs[u] = t;
                }
                if( !(pivot < xs[j])) {
                    v -= 1;
                    t = xs[j]; xs[j] = xs[v]; xs[v] = t;
                }
                /* jshint ignore:end */
            }
        }

        // if(xs[i] < pivot) { throw 'invariant'; }

        // Now, 'flip' the sides around to bring the values equal
        // to the pivot to the middle.

        j = vecswap(xs, i, v, end);
        i = vecswap(xs, start, u + 1, i);
        return {a: start, b: i,
                c: j, d: end};
        // xs[i] >= pivot.
    }

    // Shuffle the values such that all values originally in the range
    //  [a, b) are now in the range [result, c), and all values
    //  originally in [b, c) are now in [a, result).
    //
    // return result.

    function vecswap(xs, a, b, c) {
        var n = Math.min(b-a, c-b),
            i = a,
            t, j;
        for(j = c - n, i = a; j < c; j += 1, i += 1) {
            t = xs[i]; xs[i] = xs[j]; xs[j] = t;
        }
        return a + (c - b);
    }

    //
    // Data generation functions
    //

    function shuffled(N) {
        return function() {
            var result = [], i, j, t;
            for(i = 0; i < N; i += 1) {
                result[i] = i;
            }
            for(i = 0; i < N; i += 1) {
                j = Math.floor(Math.random() * i);
                t = result[i]; result[i] = result[j]; result[j] = t;
            }

            return result;
        };
    }

    function random(N) {
        return function() {
            var result = [], i;
            for(i = 0; i < N; i += 1) {
                result[i] = Math.random();
            }
            return result;
        };
    }

    function sawtooth(N, M) {
        return function() {
            var i, result = [];
            for(i = 0; i < N; i += 1) {
                result[i] = i % M;
            }
            return result;
        };
    }

    function ordered(N) {
        return function() {
            var i, result = [];
            for(i = 0; i < N; i += 1) {
                result[i] = i;
            }
            return result;
        };
    }

    function reversed(N) {
        return function() {
            var i, result = [];
            for(i = 0; i < N; i += 1) {
                result[i] = N - i;
            }
            return result;
        };
    }

    // Setup asynchronous execution so stuff shows up on the browser
    // quicker.
    var queue = [];

    // Run the first value in the queue, if any.
    function runQueue() {
        var f;
        if(queue.length) {
            f = queue.shift();
            window.setTimeout(function () {
                f();
                runQueue();
            }, 50);
        }
    }

    // Given a sort function and data to sort, run the timer on it.
    // On each iteration, copy the data to a new array.
    function runMedian(medianfcn, data, repeats) {
        var tmp = data.slice();
        qsort2(tmp);
        var N = Math.floor(data.length / 2);
        var expected = tmp[N];

        function check(med) {
            if(expected !== med) { throw 'failed'; }
        }

        function setup() {
            return data.slice();
        }

        log('running function: ' + medianfcn.name);

        time(medianfcn, repeats, setup,  check);
    }



    var repeats = 5;

    queue.push(function () {
    log('sawtooth');
        var data = sawtooth(200, 4)();
        runTest(qsort2, data, repeats);
        runMedian(quickMedian, data, repeats);
    });

    queue.push(function (){
        log('\nrandom');
        var data = random(1000000)();
        runTest(qsort2, data, repeats);
        runMedian(quickMedian, data, repeats);
    });


    queue.push(function() {
        log('\nsawtooth');

        var data = sawtooth(1000000, 4)();
        runTest(qsort2, data, repeats);
        runMedian(quickMedian, data, repeats);
    });

    queue.push(function () {


        log('\nordered');
        var data = ordered(1000000, 10)();
        runTest(qsort2, data, repeats);
        runMedian(quickMedian, data, repeats);
    });

    queue.push(function() {
        log('\nreversed');

        var data = reversed(1000000, 10)();
        runTest(qsort2, data, repeats);
        runMedian(quickMedian, data, repeats);
    });

    queue.push(function () {
        log('\nshuffled');
        var data = shuffled(1000000)();
        runTest(qsort2, data, repeats);
        runMedian(quickMedian, data, repeats);
    });

    // start it up!
    runQueue();

});
