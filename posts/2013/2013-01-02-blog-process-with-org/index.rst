.. link:
.. description:
.. tags:
.. title: My blog process with org
.. date: 2013-01-02


I keep forgetting the steps I need to do for the blogging from this
org file, so I am logging the steps here.


The directory organization looks like this:

  - ``posts``
    
    + ``2011``
    + ``2012``
    + ``2013``
      
  - ``pages``
  - ``static``

The dates are mainly an organizational tool for me.  Inside the dated
folders, there are files named like ``2012-01-01-an-example-post.org``.
I am currently using the date in the filename as the date of the
post, without a time variable.  The rest of the text in the name is
again mainly for my organization.  The title of the post is kept
inside the org file.

The ``pages`` folder is for stuff that I don't really consider a post,
things that are references that I may go back and update, or
eventually get rid of.

For now, I am using some elisp in my emacs config file to create the
post index from the files containing the posts.  The code creates the
listing on demand, instead of every time I publish -- that way I can
review the changes before publishing.

Here is the code I use for creating the indices.  It takes as a
parameter the path to the directory that I want to index.  Then, it
finds all of the ``.org`` files, grabs their titles, and inserts them
into the current buffer.  

.. code:: scm

  (defun org-dblock-write:my-get-posts (params)
    (let ((path (plist-get params :path)))
      (let ((files
             (mapcar (lambda (f)
                       (concat (file-name-as-directory path)
                               f))
                     (directory-files path nil "\.*org$"))))
        (setq files (nreverse files))
        (dolist (file files)
          (let ((title (org-publish-find-title file)))
            (message file)
            (message title)
            (insert (format " - [[file:%s][%s]]" file title))
            (newline))))))
  

To use the code, I put blocks that look like this one into my
``index.org`` file.

::
   
   ** 2013
   #+BEGIN: my-get-posts :path "posts/2013"
   #+END:


To run the snippet, inside of the block I use the command
``org-dblock-update``, bound to ``C-c C-x C-u``.  Manually calling this is
a pain, but then I can verify that the links/text look the way I want.


When I am all done, I call ``org-publish-project`` to create the output.
Then, next, I look in the publishing directory, with ``git status`` to
see what has changed.  Finally, I commit, push to github, and view.

Stuff to do:
 - make the generated timestamp match the file name, instead of
   constantly updating the stamp.
 - get more details of the config it here.


   
