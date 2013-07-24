from bottle import get, static_file

from snuggle.web import processing

# /script/compressed
@get("/script/compressed.js")
def compressed_js(): return processing.processor.script.compressed()
