.. title: Monte Carlo Simulations of Bitcoin Options
.. date: 2014/03/29 15:40:34

Based on this `Python / Julia comparison`__, I wanted to see how the
same code would work on JavaScript.

.. __: http://rawrjustin.github.io/blog/2014/03/18/julia-vs-python-monte-carlo-simulations-of-bitcoin-options/

This is just an attempt to show how JavaScript handles the numeric
computations.  On Chrome, it does pretty well.

On a MacBook Air, I am seeing times of about 1.1 second for the
100,000 iteration case from the original blog post (in Chrome).

Click run to run the simulation.  The simulation will do 10 repeats,
each with 100,000 iterations.  Every repeat will return its time, and
the ``C0`` value.  At the end, it reports the mean of the ``C0``'s.

.. raw:: html

         <button id='runButton' type='button' class='btn btn-outline-dark'>Run</button>


.. raw:: html

         <style>
         .graph {
           background-color: #e8e8e8;
           font: 10px sans-serif;
         }
         .axis path,
         .axis line {
           fill: none;
           stroke: #000;
           shape-rendering: crispEdges;
           display: none;
         }
         .point {
           fill: none;
           stroke: #112;
         }
         .line {
           fill: none;
           stroke: #112;
         }
         </style>


.. raw:: html

         <div id='output'></div>

.. raw:: html

        <script src="https://d3js.org/d3.v3.min.js" charset="utf-8"></script>
        <script src="bitcoin.d3.js" type="module"></script>



.. Delete these comments after running
.. Can add your own meta data too.
.. use TEASER _ END to mark the end of the teaser section
.. add a draft tag to drafts.
