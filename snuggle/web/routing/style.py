from bottle import get

from snuggle.web import processing

# /style/compressed
@get("/style/compressed.css")
def compressed_css(): return processing.processor.style.compressed()
