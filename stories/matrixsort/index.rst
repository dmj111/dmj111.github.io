.. title: Matrix sort demonstration
.. tags:


.. date: 2014/04/08 21:48:08

.. raw:: html

        <script src="matrixsort.js"></script>
        <style>
            td.inputLabel {
            text-align:right;
         }
        </style>

Demonstration of quicksort modified for vector or string comparisons,
as mentioned in Sedgewick's Algorithms in C++.  All bugs and mistakes
are my own...

This code solves the problem of removing all duplicate rows from a
square matrix by first sorting the rows, then using the sorted result
to find the first instance of each unique row in the matrix.

The goal was to improve the best case of the algorithm.  For this
algorithm, the "run all random" is the best case, because given enough
columns and unique values, the sort won't have to even look at many of
the values in the matrix.  The worst case is the "run equal until last
column", because every value in the matrix is examined, and the last
column will take some time to sort.

Here is the code_.

.. _code: ./matrixsort.js


.. raw:: html

    <table>
        <tr>
            <td class='inputLabel'>rows</td>
            <td><input id="rows" size="32" value="20"></td>
        </tr>
        <tr>
            <td class='inputLabel'>columns</td>
            <td><input id="columns" size="32" value="4" ></td>
        </tr>
        <tr>
            <td class='inputLabel'> num unique (for non-constant cases)</td>
            <td><input id="numUnique" size="32" value="2"></td>
        </tr>

    </table>
    <button id='runEqual'>run all equal</button>
    <button id='runRandom'>run all random</button>
    <button id='runFirstColumn'>run equal except first column</button>
    <button id='runLastColumn'>run equal except last column</button>

    <h2 id='summary'></h2>
    <pre id='output'></pre>





.. Delete these comments after running
.. Can add your own meta data too.
.. use TEASER _ END to mark the end of the teaser section
.. add a draft tag to drafts.
