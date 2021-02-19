import os
from PIL import Image
import io

def open_image(img_path:str, size:(int, int) = None) -> bytes:
  with Image.open(img_path) as im:
    if size:
      im.thumbnail(size)
    image_extension = os.path.splitext(img_path)[1][1:]
    return get_image_bytes(im, image_extension)
    
def get_image_bytes(image:Image, ext:str) -> bytes:
  f = io.BytesIO()
  if ext.upper() == "JPG":
    ext = "JPEG"
  image.save(f, format=ext)
  return f.getvalue()