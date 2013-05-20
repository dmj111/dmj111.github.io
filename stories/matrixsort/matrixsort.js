/* globals  document, window, console */

var demo = {};

(function (demo)  {
    'use strict';

    // A dumb method, but use the object properties by creating
    // strings of the rows.
    demo.hashMethod = function(matrix)  {
        var N = matrix.length,
            i,
            table = {},
            dropped = [],
            s;
        for(i = 0; i < N; i += 1) {
            s = matrix[i].toString();
            if(table[s] === undefined) {
                table[s] = 1;
            } else {
                dropped.push(i);
            }
        }
        return dropped;
    };

    // Debug for showing the ordered matrix.
    demo.showMatrix = function(matrix, rows) {
        var N = rows.length,
            i;
        for(i = 0; i < N; i += 1) {
            console.log(matrix[rows[i]]);
        }
    };

    // Create a matrix that is all ones, except the last column which
    // is randomly selected from 0 to `numUnique`.
    demo.equalUpToLastColumn = function (rows, columns, numUnique) {
        var matrix = [],
            r, c;
        for(r = 0; r < rows; r += 1) {
            matrix.push([]);
            for(c = 0; c < columns-1; c += 1) {
                matrix[r][c] = 1;
            }
            matrix[r].push(Math.floor(Math.random() * numUnique));
        }
        return matrix;
    };

    // Create a matrix that is all ones, except the last column which
    // is randomly selected from 0 to `numUnique`.
    demo.equalExceptFirstColumn = function (rows, columns, numUnique) {
        var matrix = [],
            r, c;
        for(r = 0; r < rows; r += 1) {
            matrix.push([]);
            for(c = 0; c < columns; c += 1) {
                matrix[r][c] = 1;
            }
            matrix[r][0] = Math.floor(Math.random() * numUnique);
        }
        return matrix;
    };


    demo.timer = function(fcn) {
        var start = new Date(),
            r = fcn(),
            end = new Date(),
            result = {r: r,
                      duration: (end-start)/1000};
        console.log('took: ' + result.duration);
        return result;
    };


    // Make a matrix that is all ones.
    demo.allEqual = function(rows, columns) {
        var matrix = [],
            r, c;
        for(r = 0; r < rows; r += 1) {
            matrix.push([]);
            for(c = 0; c < columns; c += 1) {
                matrix[r][c] = 1;
            }
        }
        return matrix;
    };

    // Make a matrix where every value is selected from 0 to
    // `numUnique`.  This will make it likely that the values are
    // unique.
    demo.earlyExit = function (rows, columns, numUnique) {
        var matrix = [],
            r, c;
        for(r = 0; r < rows; r += 1) {
            matrix.push([]);
            for(c = 0; c < columns; c += 1) {
                matrix[r][c] = Math.floor(Math.random() * numUnique);
            }
        }
        return matrix;
    };

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


    function vecswap(xs, a, b, c) {
        var n = Math.min(b-a, c-b),
            i = a,
            t, j;
        for(j = c - n, i = a; j < c; j += 1, i += 1) {
            t = xs[i]; xs[i] = xs[j]; xs[j] = t;
        }
        return a + (c - b);
    }
    //STARTSORT
    function matrixQSort(matrix, checkInvariant) {
        var rows = [],
            i, N = matrix.length,
            numColumns = matrix[0].length;

        // Set up an indirection array.
        for(i = 0; i < N; i += 1) {
            rows[i] = i;
        }

        sort(rows, 0, 0, N);
        return rows;

        // The sort body.
        function sort(rows, column, start, end) {
            // End the recursion if there is only one row left to
            // consider, or if we are past the last column.
            if(end - start < 2 || column === numColumns) {
                return;
            }
            var i = start - 1,
                j = end,
                u = start,
                v = j,
                pivotRow = rows[Math.floor((start + end) / 2)],
                pivot = matrix[pivotRow][column],
                t;

            if(end - start > 20) {
                // Do a median of three if there are more
                pivot = medianOfThree(matrix[rows[start]][column],
                                      pivot,
                                      matrix[rows[end-1]][column]);
            }

            // Reorder the values, and maintain the indices so we have
            // the following:
            //
            // begin (inclusive)  |  end (exclusive)  |   description
            // start              |  u                |   == pivot
            // u                  |  i                |    < pivot
            // i                  |  v                |    > pivot
            // v                  |  end              |   == pivot

            while(i < j) {
                i += 1;
                while(i < j && matrix[rows[i]][column] < pivot) {
                    i += 1;
                }

                j -= 1;
                while(i < j && pivot < matrix[rows[j]][column]) {
                    j -= 1;
                }

                if(i < j) {
                    t = rows[i]; rows[i] = rows[j]; rows[j] = t;

                    // Maintain the fat partition by moving equal
                    // values out the ends.
                    if( pivot === matrix[rows[j]][column]) {
                        v -= 1;
                        t = rows[j]; rows[j] = rows[v]; rows[v] = t;
                    }
                    if(matrix[rows[i]][column] === pivot) {
                        t = rows[i]; rows[i] = rows[u]; rows[u] = t;
                        u += 1;
                    }
                }
            }

            if(i === j && pivot === matrix[rows[i]][column]) {
                t = rows[i]; rows[i] = rows[u]; rows[u] = t;
                u += 1;
                i += 1;
            }
            if(checkInvariant) {
                (function() {
                    var k;
                    function check(result) {
                        if(!result) {
                            throw 'check failed';
                        }
                    }

                    for(k = start; k < u; k += 1) {
                        check(matrix[rows[k]][column] === pivot);
                    }

                    for(k = u; k < i; k += 1) {
                        check(matrix[rows[k]][column] < pivot);
                    }

                    for(k = i; k < v; k += 1) {
                        check(matrix[rows[k]][column] > pivot);
                    }

                    for(k = v; k < end; k += 1) {
                        check(matrix[rows[k]][column] === pivot);
                    }
                }());
            }

            // Now, 'flip' the sides around to bring the values equal
            // to the pivot to the middle.
            j = vecswap(rows, i, v, end);
            i = vecswap(rows, start, u, i);

            if(checkInvariant) {
                (function() {
                    function check(result) {
                        if(!result) {
                            throw 'check failed';
                        }
                    }

                    var k;
                    for(k = start; k < i; k += 1) {
                        check(matrix[rows[k]][column] < pivot);
                    }

                    for(k = i; k < j; k += 1) {
                        check(matrix[rows[k]][column] === pivot);
                    }

                    for(k = j; k < end; k += 1) {
                        check(matrix[rows[k]][column] > pivot);
                    }
                }());
            }

            // Sort the rows that matched the entry, but step them to
            // the next column.
            sort(rows, column + 1, i, j);

            // Sort the things that were not equal to the pivot still
            // using the same column.
            sort(rows, column, start, i);
            sort(rows, column, j, end);
        }
    }
    //ENDSORT

    demo.matrixQSort = matrixQSort;


    demo.deleteDuplicates = function(matrix, checkInvariant) {
        var sortedRows = matrixQSort(matrix, checkInvariant),
            rowsToUse = [],
            result = [],
            N = matrix.length,
            M = matrix[0].length, // assume matrix non-empty and square
            i, j, u, v, currentToKeep, areDifferent;

        // Keep track of the rows to use.
        for(i = 0; i < N; i += 1) {
            rowsToUse[i] = 0;
        }

        // Always keep the first row!
        currentToKeep = sortedRows[0];

        // Now check the ordered array, looking for non-duplicates.
        //
        // We want to keep the first occurrence of a value, but the
        // sort was not stable. So... we are going to walk through
        // this array and track the lowest index of the current value.
        // When the row changes, we will save off the first index of
        // the previous group and start again.
        for(i = 1; i < N; i += 1) {
            v = matrix[sortedRows[i]];
            u = matrix[currentToKeep];
            areDifferent = false;
            for(j = 0; j < M; j += 1) {
                if(u[j] !== v[j]) {
                    // These are different!  keep the previous one.
                    areDifferent = true;
                    break;
                }
            }
            if(areDifferent) {
                // Mark the previous currentToKeep, and update the value.
                rowsToUse[currentToKeep] = 1;
                currentToKeep = sortedRows[i];
            } else {
                // Rows are equal.  keep the one around with the
                // lowest index.
                if(sortedRows[i] < currentToKeep) {
                    currentToKeep = sortedRows[i];
                }
            }
        }
        // Ok, now, update the for the last group.
        rowsToUse[currentToKeep] = 1;

        // Now, build up the result by grabbing all of the ok rows.
        for(i = 0; i < N; i += 1) {
            if(rowsToUse[i]) {
                result.push(matrix[i]);
            }
        }
        return result;
    };



    window.addEventListener('load', function() {
        // Warning... my JavaScript front-end skills are non-existent.

        var output = document.getElementById('output');
        var summary = document.getElementById('summary');
        var rowElem = document.getElementById('rows');
        var columnElem = document.getElementById('columns');
        var numUniqueElem = document.getElementById('numUnique');

        function run(genFcn, desc) {
            var rows = parseInt(rowElem.value);
            var columns = parseInt(columnElem.value);
            var numUnique = parseInt(numUniqueElem.value);
            var failed = false;
            output.innerText = '';
            summary.innerText = '';
            if(isNaN(rows) || rows < 1) {
                output.innerText += 'could not parse rows as an integer';
                failed = true;
            }
            if(isNaN(columns) || columns < 1) {
                output.innerText += 'could not parse columns as an integer';
                failed = true;
            }
            if(isNaN(numUnique) || numUnique < 1) {
                output.innerText += 'could not parse num unique as an integer';
                failed = true;
            }
            if(!failed) {
                output.innerText += 'Running ' + desc + ' with ' +
                    rows + ' rows, ' + columns +
                    ' columns, and numUnique=' + numUnique;
            }

            window.setTimeout(function () {
                var matrix = demo.timer(function() {
                    return genFcn(rows, columns, numUnique);
                });
                output.innerText += '\ntook ' + matrix.duration +
                    ' seconds to generate data';
                var result = demo.timer(function () {
                    return demo.deleteDuplicates(matrix.r);
                });
                summary.innerText = 'deleting duplicates took ' +
                    result.duration + ' seconds';

                if(rows * columns < 2000) {
                    var i;
                    output.innerText += '\nOriginal matrix';
                    for(i = 0; i < matrix.r.length; i += 1) {
                        output.innerText += '\n' + matrix.r[i];
                    }
                    output.innerText += '\n\nDe-duplicated matrix (' +
                        result.r.length + ' rows)';
                    for(i = 0; i < result.r.length; i += 1) {
                        output.innerText += '\n' + result.r[i];
                    }


                }

            }, 100);
        }

        var runEqual = document.getElementById('runEqual');
        runEqual.addEventListener('click', function () {
            run(demo.allEqual, 'all equal values');
        });
        var runRandom = document.getElementById('runRandom');
        runRandom.addEventListener('click', function () {
            run(demo.earlyExit, 'all random values');
        });

        var runLastColumn = document.getElementById('runLastColumn');
        runLastColumn.addEventListener('click', function () {
            run(demo.equalUpToLastColumn, 'equal except the last column');
        });

        var runFirstColumn = document.getElementById('runFirstColumn');
        runFirstColumn.addEventListener('click', function () {
            run(demo.equalExceptFirstColumn, 'equal except the first column');
        });

    });
}(demo));
