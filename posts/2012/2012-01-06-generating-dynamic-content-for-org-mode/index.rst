.. link:
.. description:
.. tags:
.. title: Generating dynamic content for org mode
.. date: 2012-01-06 08:00

I wanted to create the indices for my plentiful posts from code,
instead of by hand. In the past, I remember doing something like that
in Emacs Wiki or Muse modes, and I wasn't sure how to do it in org
mode.

Org Babel seemed like the way to go, but I had trouble getting it to
work.  Instead, I used `dynamic blocks
<[http://orgmode.org/manual/Dynamic-blocks.html#Dynamic-blocks>`_ in
org mode to create the listings.

In my ``index.org`` file, I have the following lines.

::

    #+BEGIN: my-get-posts :path "posts/2012"
    #+END:


This says to call the function ``org-dblock-write:my-get-posts``, with
the argument ``:path`` set to ``posts/2012``.  The function arguments are
passed as a plist, which is basically a list of name/value pairs.

This code is called by typing ``C-c C-x u`` some where in the block,
which calls ``(org-dblock-update)`` to update the region inside the
block.

The update function is below.  The function looks up the files in the
path, and then for each file it looks up the title in the file, and
finally generates a link that org will understand.

.. code:: scm

  (defun org-dblock-write:my-get-posts (params)
    (let ((path (plist-get params :path)))
      (let ((files
             (mapcar (lambda (f)
                       (concat (file-name-as-directory path)
                               f))
                     (directory-files path nil "\.*org"))))
        (setq files (nreverse files))
        (dolist (file files)
          (let ((title (org-publish-find-title file)))
            (insert (format " - [[file:%s][%s]]" file title))
            (newline))))))


Here is what the results look like for the example above:

::

     #+begin_example
     ** 2011
     #+BEGIN: my-get-posts :path "posts/2011"
      - [[file:posts/2011/2011-12-18-stanford-online-classes.org][Stanford Online Classes]]
      - [[file:posts/2011/2011-12-18-ipython-on-mac-os-x.org][IPython on the mac]]
      - [[file:posts/2011/2011-12-18-ants-ai-challenge.org][Ants AI Challenge]]
      - [[file:posts/2011/2011-11-19-a-simple-octave-tip.org][A simple Octave tip]]
      - [[file:posts/2011/2011-11-03-posting-from-emacs-with-org2blog-wp.org][Posting from emacs with org2blog/wp]]

     #+END:


This output then gets converted into the list of links that show up on
the home page.
