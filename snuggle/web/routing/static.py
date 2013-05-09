from bottle import get, static_file

from snuggle.web import processing

# /<path:path>
@get("/<path:path>")
def static(path): return processing.processor.static_file(path)
