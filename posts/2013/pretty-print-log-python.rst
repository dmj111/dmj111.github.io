.. link:
.. description:
.. tags:
.. title: Pretty print logging in Python
.. date: 2013-05-17


From the Python `logging documentation
<http://docs.python.org/3.3/howto/logging.html#using-arbitrary-objects-as-messages>`_,
we can send an arbitrary object into a log message call.


.. code:: python

    import pprint

    class PrettyLog():
        def __init__(self, obj):
            self.obj = obj
        def __repr__(self):
            return pprint.pformat(self.obj)

Then, in the code, we can use it with ``logging``.

.. code:: python

          import logging
          
          # ...

          logging.debug(PrettyLog(obj))  


The string isn't created until it is needed, so if the logging level
is not high enough, the only method call is the creation of the
``PrettyLog`` object.






