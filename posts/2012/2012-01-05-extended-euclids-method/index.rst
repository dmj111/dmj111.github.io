.. link:
.. description:
.. has_math: true
.. title: Extended Euclid's Method
.. date: 2012-01-05 8:00

..  alias : [/posts/2012/2012-01-05-extended-euclids-method.html]


In "The Art of Computer Programming, Volume 1", Donald Knuth describes
the algorithm for Euclid's Method.

Euclid's method find the greatest common divisor for two numbers.  The
greatest common divisor of two integers :math:`m` and :math:`n` is the
largest integer :math:`d` such that both :math:`m` and :math:`n` are
divisible by :math:`d` .


The extended algorithm goes farther than just finding the gcd.  The
extended method finds integers :math:`a` and :math:`b` such that

.. math::

   am + bn = \gcd(m,n)


This OCaml code is a straightforward translation from the algorithm in
Knuth's book, and it is written longer than it needs to be to make the
names clearer.  Also, this is an example of replacing a loop with
recursion.

.. code:: ocaml

  let euclid_extended m n =
    let rec loop a b a' b' c d = 
      let q = c / d in 
      let r = c - q * d in 
      Printf.printf "| %d | %d | %d | %d | %d | %d|\n" a a' b b' c d;
      if r = 0 then
        a,b,d
      else
         let c_new = d in 
         let d_new = r in
         let a_new = a' - q * a in 
         let a'_new = a in
         let b_new = b' - q * b in 
         let b'_new = b in 
         loop a_new b_new a'_new b'_new c_new d_new
    in 
    loop 0 1 1 0 m n
  
  let test() = 
    let m, n = 1769, 551 in 
    Printf.printf "| a| a' | b | b' | c| d|\n|---\n";
    let a,b,d = euclid_extended m n in
    Printf.printf "a %d:  b: %d\n" a b;
    Printf.printf "test result: %d\n" (a * m + b * n);



Running the code produces the following table.

===  === ===== ==== ====== =====
  a   a'     b   b'      c     d  
===  === ===== ==== ====== =====
  0    1     1    0   1769   551  
  1    0    -3    1    551   116  
 -4    1    13   -3    116    87  
  5   -4   -16   13     87    29
===  === ===== ==== ====== =====  

Here we can easily verify that :math:`5 * 1769 - 16 * 551 = 29`.  The
table gives us a nice way to see that :math:`a m + b n = d` during all
of the steps of the algorithm.  Of course, Knuth already has the same
table in his book, but some people, like me, don't really learn
something until they have done it themselves.










