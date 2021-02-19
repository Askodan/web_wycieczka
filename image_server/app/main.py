import os
import shutil
import zipfile
from typing import Optional
from fastapi import FastAPI, Form, File, UploadFile, HTTPException
from fastapi.responses import Response, StreamingResponse
import app.image_handler as ih

app = FastAPI()

source_path = "/velo_dunajec"
zip_file_path = "/velo_dunajec/temp_zip.zip"
content="Content-Disposition"

goodExtensions = [".jpg", ".JPG", 
                  ".jpeg", ".JPEG",
                  ".png", ".PNG"]

def get_images_list(path):
    return [f for f in os.listdir(path) if os.path.splitext(f)[1] in goodExtensions]


def get_zipped_files(path):  
    if not os.path.exists(path):
        return []
    zipf = zipfile.ZipFile(path)
    zipped_files = zipf.namelist()
    zipf.close()
    return zipped_files


def create_zip():
    images = get_images_list(source_path)
    zipped = get_zipped_files(zip_file_path)
    for image in images:
        if image not in zipped:
            add_file_to_zip(source_path, image)
  

def add_file_to_zip(path, file_name):
    file_path = os.path.join(path, file_name)
    zipf = zipfile.ZipFile(zip_file_path, "a")
    zipf.write(file_path, file_name)
    zipf.close()


@app.post("/upload/image")
async def upload_photo(photo: UploadFile = File(...)):
    try:
        photo.file.seek(0)
        with open(os.path.join(source_path, photo.filename), "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
    finally:
        photo.file.close()    
    return {"Result": "File consumed"}


@app.get("/list/images")
async def list_photos():
    return get_images_list(source_path)
    
    
@app.get("/pack/image")
async def pack_photo(name: str = None, height: int = None, width: int = None):
    if not name:
        return HTTPException(status_code=404, detail="Couldn't find an image without name")
    image_path = os.path.join(source_path, name)
    if width:
        if height:
            raw_data = ih.open_image(image_path, (width, height))
        else:
            raw_data = ih.open_image(image_path, (width, 100000))
    else:
        if height:
            raw_data = ih.open_image(image_path, (100000, height))
        else:
            with open(image_path, 'rb') as data:
                raw_data = data.read()
    return Response(content=raw_data, media_type="application/octet-stream", headers={content:"attachment;filename="+name})

@app.get("/pack/image/{name}")
async def pack_photo_url(name: str = None, height: int = None, width: int = None):
    if not name:
        return HTTPException(status_code=404, detail="Couldn't find an image without name")
    image_path = os.path.join(source_path, name)
    if width:
        if height:
            raw_data = ih.open_image(image_path, (width, height))
        else:
            raw_data = ih.open_image(image_path, (width, 100000))
    else:
        if height:
            raw_data = ih.open_image(image_path, (100000, height))
        else:
            with open(image_path, 'rb') as data:
                raw_data = data.read()
    return Response(content=raw_data, media_type="application/octet-stream", headers={content:"attachment;filename="+name})    

@app.get("/get_zip/images")
async def pack_photos_all():
    create_zip()
    file_like = open(zip_file_path, mode="rb")
    return StreamingResponse(file_like,  media_type='application/octet-stream', headers={content:"attachment;filename="+zip_file_path})