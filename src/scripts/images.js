
displayed_images = [];
miniature_size = 200;

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function SendImages(images, callback)
{
  DisplayImagesLoader(true);
  asyncForEach(images, async (photo, index, photos) => {
    let formData = new FormData();
    formData.append("photo", photo); 
    try {
       let r = await fetch('/upload/image', {method: "POST", body: formData}); 
       console.log('SendImage: HTTP response code:', r.status);  
       if (r.status != 200)
       {
        return;
       }      
       else if (photos.length == index+1) // ostatni obrazek
       {
         callback();
         DisplayImagesLoader(false);
       }

    } catch(e) {
       console.log('SendImage: Huston we have problem...:', e);
    }    
  });

}

async function SendImage(image, callback)
{
    let formData = new FormData();
    formData.append("photo", image); 
    try {
       let r = await fetch('/upload/image', {method: "POST", body: formData}); 
       console.log('SendImage: HTTP response code:', r.status); 
       callback();
    } catch(e) {
       console.log('SendImage: Huston we have problem...:', e);
    }
    
}

async function GetListOfImages()
{
  try {
    let r = await fetch('/list/images', {method: "GET"}); 
    console.log('GetListOfImages: HTTP response code:', r.status); 
    let images_names = await r.json();
    let newElements = images_names.filter(n => !displayed_images.includes(n));
    console.log('Nowy element', newElements);
    DisplayNewImages(newElements);
    let ic = document.getElementById("image_count");
    ic.innerHTML = images_names.length;

  } catch(e) {
      console.log('GetListOfImages: Huston we have problem...:', e);
  }
}

async function GetImage(image_name, small)
{
  try {
    let path = hostname_ + "/pack/image";
    var url = new URL(path);
    params = {name: image_name}
    if (small)
    {       
      params.width = miniature_size; 
      params.height = miniature_size;
    }
    url.search = new URLSearchParams(params).toString();

    const response = await fetch(url);
    console.log('GetImage: HTTP response code:', response.status); 
    src = URL.createObjectURL(await response.blob());
    if (small)
    {
      ShowMiniature(src, image_name);
    }
    else
    {
      ShowFullSizedImage(src, image_name);
    }

  } catch(e) {
      console.log('GetListOfImages: Huston we have problem...:', e);
  }
}

function DisplayImagesLoader(display)
{
  console.log("DisplayImagesLoader", display);
  document.getElementById("loader").style.visibility = display ? "visible" : "hidden";
  document.getElementById("loader").style.height = display ? "120px" : "0px";
  document.getElementById("images_div").style.visibility = display ? "hidden" : "visible";
 
}

function DisplayNewImages(images)
{
  
  displayed_images += images;
  asyncForEach(images, (image) => {
    GetImage(image, true);
  });
}

async function AddImage(images) 
{   
  let status = await SendImages(images.files, GetListOfImages);
}

function DisplayFullImage(event)
{
  image_name = event.path[0].name;
  GetImage(image_name);
}

function ShowMiniature(src, name) 
{
  var img = document.createElement("img");
  img.id = "miniature";
  img.src = src;
  img.height = miniature_size;
  img.name = name;
  img.onclick = DisplayFullImage;
  var div = document.getElementById("images_div");
  div.appendChild(img);
}

function ShowFullSizedImage(src, name)
{
  var modal = document.getElementById("myModal");
  modal.style.display = "block";
  var modalImg = document.getElementById("img01");
  modalImg.src = src;
  modalImg.alt="hue";
  var captionText = document.getElementById("caption");
  captionText.innerHTML = name;

  var link = document.getElementById("img_link");
  link.href = src;
  link.download = name;
}

function OnLoad(){
  
  var modal = document.getElementById("myModal");
  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];
  // When the user clicks on <span> (x), close the modal
  span.onclick = function() { 
    modal.style.display = "none";
  }

  hostname_ = location.protocol + "//" + location.hostname + ":" + location.port;

  setInterval(GetListOfImages, 20000);
}



