/* jshint strict: true, unused:true, undef:true, browser:true */
/* globals quicksort, console, document, test, resume, assert, pause */

(function(exports) {
    'use strict';

    function identity(x) {
        return x;
    }

    // Return an object with all of the sorting functions as
    // properties.  The keyFunction is used to pull a key out of the
    // value, which is compared with <.
    //
    // keyFunction defaults to the identity function.
    // INSERT_THRESHOLD is the size below which we just use insertion sort.

    function quicksortBy(keyFunction, INSERT_THRESHOLD) {
        keyFunction = keyFunction || identity;
        INSERT_THRESHOLD = INSERT_THRESHOLD || 30;


        var quicksort = {};

        // Test function to make sure that the array is sorted using
        // the key function.
        quicksort.isSorted = function(array) {
            var N = array.length,
                result = true,
                i;
            for(i = 1; i < N; i += 1) {

                if(keyFunction(array[i]) < keyFunction(array[i-1])) {
                    result = false;
                    break;
                }
            }
            return result;
        };

        // Reorders the values in the array indexed by i1, i2, and i3,
        // such that array[i1] <= array[i2] <= array[i3].
        // MED3START
        function medianOfThree(array, i1, i2, i3) {
            var e1 = array[i1],
                x1 = keyFunction(e1),
                e2 = array[i2],
                x2 = keyFunction(e2),
                e3 = array[i3],
                x3 = keyFunction(e3),
                t;

            if(x2 < x1) {
                t = x1; x1 = x2; x2 = t;
                t = e1; e1 = e2; e2 = t;
            }

            if(x3 < x2) {
                t = x3; x3 = x2; x2 = t;
                t = e3; e3 = e2; e2 = t;
            }

            if(x2 < x1) {
                t = x1; x1 = x2; x2 = t;
                t = e1; e1 = e2; e2 = t;
            }
            array[i1] = e1;
            array[i2] = e2;
            array[i3] = e3;
        }
        // MED3END
        // Do an insertion sort on the array from start to end-1
        function isort(array, start, end) {
            var a, b, t, kt;
            for(a = start; a < end; a += 1) {
                t = array[a];
                kt = keyFunction(t);
                for(b = a; b > start &&
                    kt < keyFunction(array[b-1]); b -=1 ) {
                    array[b] = array[b - 1];
                }
                array[b] = t;
            }
        }

        function swap(array, i, j) {
            var t = array[i];
            array[i] = array[j];
            array[j] = t;
        }

        // Quicksort the array from index start to index end - 1.
        function qsort(array, start, end) {
            start = start || 0;
            end = end || array.length;
            if((end - start) < INSERT_THRESHOLD) {
                isort(array, start, end);
                return;
            }
            var pivot = end - 2;
            swap(array, Math.floor((start + end) / 2), pivot);
            medianOfThree(array, start, pivot, end - 1);
            var a = start,
                b = pivot,
                pivotVal = keyFunction(array[pivot]),
                av, bv;

            while (a < b) {
                a += 1;
                av = keyFunction(array[a]);
                while(a < b && av < pivotVal) {
                    a += 1;
                    av = keyFunction(array[a]);

                }
                b -= 1;
                bv = keyFunction(array[b]);
                while(a < b && pivotVal < bv) {
                    b -= 1;
                    bv = keyFunction(array[b]);
                }
                if (a < b) {
                    swap(array, a, b);

                }
            }
            swap(array, a, pivot);
            qsort(array, start, a);
            qsort(array, a + 1, end);
        }

    exports.quicksortBy = quicksortBy;
    exports.quicksort = quicksort;

} (typeof exports !== 'undefined' && exports || this));


var testing = {
    arrayInit: function(N, f) {
        var result = [],
            i;
        for(i = 0; i < N; i += 1) {
            result[i] = f(i);
        }
        return result;

    },

    makeReversed: function(N) {
        return this.arrayInit(N, function(i) { return N - i; });
    },

    makeOrdered: function(N) {
        return this.arrayInit(N, function(i) { return i; });
    },

    makeOrgan: function(N) {
        return this.arrayInit(N, function(i) {
            return Math.abs(N/2 -  i);
        });
    },

    makeRandom: function(N) {
        return this.arrayInit(N, function() { return Math.random(); });
    },

    makeStriped: function(N) {
        return this.arrayInit(N, function(i) { return i % 2; });
    },

    makeCategories: function(categories) {
        return function(N) {
            return this.arrayInit(N, function() {
                return Math.floor(Math.random() * categories);
            });
        };
    },

    time: function(fcn, args) {
        var log = console.log;
        if(typeof skewer !== 'undefined') {
            log = skewer.log;
        }

        var start = new Date(),
            r = fcn.apply(fcn, args),
            end = new Date();
        console.log('took ' + (end - start) / 1000 + ' seconds');
        return {result: r,
                time: (end-start) / 1000};
    }
};

testing.compareCount = 0;
testing.cmp = function(a, b) {
    testing.compareCount += 1;
    return a - b;
};

testing.qs = quicksortBy();
