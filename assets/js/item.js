const itemID = new URLSearchParams(location.search).get("id");
//the location.search contains all the queries in the URL and the new URLSearchParams converts the location.search into readable object
//which then can be used to methods like .get(),.has(),.keys(),.values()
//the .get method searches the parameter for "id" in the itemID
const states = new URLSearchParams(location.search);
const page = states.get("page");
const genre = states.get("genre");
const search = states.get("search");
const topname = states.get("topname");
const topval = states.get("topval");
const order = states.get("order");

localStorage.setItem("page",page);
localStorage.setItem("genre",genre);
localStorage.setItem("search",search);
localStorage.setItem("topname",topname);
localStorage.setItem("topval",topval);
localStorage.setItem("order",order);

//variables for item description
const itemTitle = document.querySelector(".headerEl .item-details .itemTitle h1");
const itemImage = document.querySelector(".headerEl .item-details .itemImage img");
const backgroundImage = document.querySelector(".background");
const genreList = document.querySelector(".genres .list");
const detailsStat = document.querySelector(".details .status p");
const detailsStud = document.querySelector(".details .studios p");
const synopsisTxt = document.querySelector(".synopsis p");


console.log(page);
console.log(genre);

const h1 = document.querySelector("h1");
const bodyEl = document.querySelector("body");
h1.innerText = `this is the id of the item: ${itemID}`;
loadItem();
async function loadItem(){
    try {
        const res = await fetch(`https://anime-array.vercel.app/anime/details/${itemID}`);
        const data = await res.json();
        const anime = data.data;

        itemTitle.innerText = anime.titles[0].title || anime.titles[1].title;
        itemImage.src = anime.images.jpg.image_url || anime.images.webp.image_url;
        backgroundImage.style.backgroundImage = `linear-gradient(rgba(255,255,255,0.9), rgba(0,0,0,0.9)),url(${anime.images.jpg.image_url || anime.images.webp.image_url})`;

        detailsStat.innerText = anime.status;
        detailsStud.innerText = anime.studios.map(studio => studio["name"]).join(", ") || "[No records found]";
        synopsisTxt.innerText = anime.synopsis;
        anime.genres.forEach(genre =>{
            const genreDiv = document.createElement("div");
            const genreP = document.createElement("p");


            genreDiv.classList.add("genre");
            genreP.innerText = genre.name;
            genreDiv.appendChild(genreP);
            genreList.appendChild(genreDiv);
        })


        
        console.log(anime.mal_id);
        // image.src = data.data.images.jpg.image_url || data.data.images.webp.image_url;

        // bodyEl.appendChild(image);

    } catch (error) {
        console.error(error);
    }
}

const footerLogos = document.querySelectorAll(".footer-links .social-links img");

footerLogos.forEach(e=>{
  e.addEventListener("mouseover",()=>{
    if(e.src.includes("linklight.svg")){
      e.src = "../images/linkwhite.svg"
    }
    else if(e.src.includes("gitlight.svg")){
      e.src = "../images/gitwhite.svg"
    }
    else if(e.src.includes("facelight.svg")){
      e.src = "../images/facewhite.svg"
    }
  })

  e.addEventListener("mouseout",()=>{
    if(e.src.includes("linkwhite.svg")){
      e.src = "../images/linklight.svg"
    }
    else if(e.src.includes("gitwhite.svg")){
      e.src = "../images/gitlight.svg"
    }
    else if(e.src.includes("facewhite.svg")){
      e.src = "../images/facelight.svg"
    }
  })
  
})
