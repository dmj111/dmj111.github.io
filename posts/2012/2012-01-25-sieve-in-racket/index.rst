.. link:
.. description:
.. tags:
.. title: Sieve of Eratosthenes in Racket
.. date: 2012-01-25


To learn some `Racket <http://racket-lang.org/>`_ I ported this `this
Ocaml code <http:/blog/2012/01/07/sieve-of-eratosthenes/>`_ to Scheme.

Racket has lots of nice features that I want to learn about.  The
pattern matching brings something to lisp code that I would miss from
the ML / Haskell languages.  There is a batteries included approach,
which helps with the usual knock against scheme that there isn't
enough library support.  There are also list comprehensions,
but they are even more than just list comprehensions.

The comprehensions can walk over lists, vectors, and strings.  The
type can be specified to make the performance faster.  This is my
favorite part so far -- they can generate vectors instead of lists,
which we will see in this code.

Without further delay, here is a learning attempt with Racket.

.. code:: rkt

  #lang racket
  
  (define (sieve n)  
    (let*
        ((limit (round (/ (+ 1 (inexact->exact (round (sqrt n))))
                          2)))
         (m (round (/ (+ 1 n) 2)))
         (ar (make-vector m 1)))
  
      ;; element 0 is really for number 1, so we do not 
      ;; want to drop its multiples.
      (for ([i (in-range 1 limit)])
           (when (= (vector-ref ar i) 1)
             (let
                 ((p (+ (* 2 i) 1)))
               (for ([j (in-range (* (+ p 1) i) m p)])
                    (vector-set! ar j 0)))))
  
      ;; Collect all of the non-zero elements
      (let ((result 
             (for/vector
              ([(x i) (in-indexed (in-vector ar))]
               #:when (> x 0))
              (+ 1 (* 2 i)))))
        ;; now, set the first element to 2, since it is
        ;; currently holding 1.
        (vector-set! result 0 2)
        result)))
  


As it stands, this code runs about five times slower than the compiled
OCaml, but I am not sure if I am running it in under the JIT compiler
yet by doing everything in the REPL.

**Edit** Outside of the REPL this appears to only take twice as long
as the compiled OCaml code.


