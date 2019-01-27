        .. title: Non-recursive DFS
.. tags:
.. date: 2014/04/20 09:34:41

.. |--| unicode:: U+2013   .. en dash
.. |---| unicode:: U+2014  .. em dash, trimming surrounding whitespace
   :trim:
.. |...| unicode:: U+2026  .. ellipsis


Depth-first search (DFS_) is a powerful algorithm.  The recursive DFS
algorithm is probably the easiest to understand, and most of the time
it is good enough.

.. _DFS: http://en.wikipedia.org/wiki/Depth-first_search

In some problems, the recursion stack gets very large.  This can
easily blow the stack limit in Python. Fortunately, there is a simple
way to make the algorithm iterative.

Recursive DFS implementations sometimes ignore the pre or post
numbering of the vertexes, because they aren't needed |--| the work is
done in the recursive call.  Those numbers are key to the iterative
algorithm.

The main idea of the recursive algorithm is to visit every vertex, and
at each visit:

- Set the pre-order number.
- Visit all unvisited children.
- Set the post-order number.

In a recursive algorithm, we can also do some work before visiting the
child vertexes, while visiting them, or after.

The pre-order and post-order numbers are the key to making DFS
iterative.  We will use an explicit stack for this algorithm.

First, we add the starting vertex to the stack.  Then, while the stack
is non-empty, we pop the last vertex off of the stack and do the
following:

1. If the vertex has a post-order number, skip it.

2. Otherwise, if the vertex has a pre-order number, we are in the
   post-child step.

  a. Set the post-order number and do any post processing.

3. Otherwise, we are now visiting the vertex for the first time.

  a. Set the pre-order number.
  b. Add the vertex back to the stack.
  c. Add all of its unvisited children to the stack.

Let's informally check if this makes sense.

- A vertex is added to the stack only if it has not been visited
  (pre-order is not set), or while it is being visited, before its
  children are added to the stack.  (3a and 3b)

- A vertex only hits step 3 once.  After step 3, it has a pre-order
  number, so the next time the vertex is processed, it will go to
  step 2.

- The vertex only makes it to step 2 after its children have been
  processed.

- So, step 2 is the post-order step.

Finally, here is some code

.. include:: code/dfs.py
   :code: python
   :start-after: #STARTDFS
   :end-before: #ENDDFS


This code only handles starting a search tree from a specific vertex.
To search the entire graph, the ``dfs`` method needs to be called for
every vertex.  That order is up to the caller. Pre-order or post-order
steps can be added to this code, or it could be generalized to provide
hooks for sub-classes to use.
