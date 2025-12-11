const anilist = document.querySelector(".content .list"); 
const nextBtn = document.querySelectorAll(".pagination .nextpgBtn");
const backBtn = document.querySelectorAll(".pagination .prevpgBtn");
const pageNum = document.querySelectorAll(".pagination .page-number");
const search = document.querySelector(".navbar .search-bar");
const header = document.querySelector(".content .body-header");
const animfilter = document.querySelector(".filters .select.order");
const genreBtns = document.querySelectorAll(".side-bar .tags-btn");
const mainContent = document.querySelector(".main .content");
const thirdChild = mainContent.children[2];
const select_btnTop = document.querySelector(".select-btn.top");
const dropdownTop = document.getElementById("filter-top");
const btn_txtTop = dropdownTop.querySelector(".btn-top");

const topfilterOptions = document.querySelectorAll(".filters .select.top .dropdown-menu .dropdown-item.top");
const orderfilterOptions = document.querySelectorAll(".filters .select.order .dropdown-menu .dropdown-item.order");

const page = localStorage.getItem("page");
const genre = localStorage.getItem("genre");
const searchKey = localStorage.getItem("search");
const topname = localStorage.getItem("topname");
const topval = localStorage.getItem("topval");
const orderKey = localStorage.getItem("order");

function debounce(fn, delay = 400) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

let isLoading = false;

//Final-To-do: add more description in item page

//Done: Optimized and Dynamic dark mode toggle with saved preference in localStorage WebAPI
//Done: Optmized the fetch functions and converted into single dynamic function
//Done: Dynamic Pagination based on filter and search
//Done: next button page not supposed to increase when there are no pages left in the fetched data
//Done: create a separate page for anime description
//Done: added 2 dropdown list options : featured items and filter anime
//Done: added simultanous genre filtering and searching anime vice versa
//Done: optimized the page states
//Done: added dynamic page description
//Done: improved UI for item-list


//debouncing loadPage
const debouncedLoadPage = debounce(loadPage, 400);


//anime description page
anilist.addEventListener("click", e=>{
  const item = e.target.closest(".list-item");
  if(!item) return;
  const itemID = item.getAttribute("id");
  // console.log(itemID);

  window.location.href = `./assets/pages/item.html?id=${itemID}&page=${pageState.page}&genre=${pageState.genre}
&search=${pageState.search}&topname=${pageState.topFilter.name}
&topval=${pageState.topFilter.value}&order=${pageState.orderFilter}`;
})

anilist.addEventListener("click", e=>{
  const reloadBtn = e.target.closest(".loading-failed img");
  if(!reloadBtn) return;
  debouncedLoadPage();
})

//logo dropdown options
const dropdownLinks = document.querySelectorAll(".dropdown-list .dropdown-item.toggle .item-container");
dropdownLinks.forEach(e=>{
  e.addEventListener("click",()=>{
    if(e.classList.contains("about")) window.location.href = `./assets/pages/placeholder.html`;
    else if(e.classList.contains("git")) window.location.href = `./assets/pages/placeholder.html`;
  })
})


//state variable and object
let lastPage = 1;
const pageState = {
  page: 1,
  genre: null,
  search: null,
  topFilter:{name:"Seasonal Anime", value:"seasonalAnime"},
  orderFilter:"popularity"
}

if(page){
  pageState.page = page;
  localStorage.removeItem("page");
}
if(genre){
  pageState.genre = genre;
  if(pageState.genre === "null") pageState.genre = null;
  genreBtns.forEach(e => {
    if(e.dataset.value === pageState.genre) e.classList.add("active");
  })
  localStorage.removeItem("genre");
}
if(searchKey){
  pageState.search = searchKey;
  if(pageState.search === "null") pageState.search = null;
  localStorage.removeItem("search");
}
if(topname){
  pageState.topFilter.name = topname;
  localStorage.removeItem("topname");
}
if(topval){
  pageState.topFilter.value = topval;
  localStorage.removeItem("topval");
}
if(orderKey){
  pageState.orderFilter = orderKey;
  localStorage.removeItem("order");
}

//genre filter buttons
genreBtns.forEach(genreBtn =>{
  genreBtn.addEventListener("click",()=>{
    genreBtns.forEach(e => e.classList.remove("active"));
    pageState.page = 1;
    pageState.genre = genreBtn.dataset.value;
    pageNum.page = 1;
    genreBtn.classList.add("active");
    debouncedLoadPage();
  })
})

//search field
const searchField = document.querySelector(".search-container input");
searchField.addEventListener("keydown",e =>{
  if(e.key === "Enter"){
    pageState.search = searchField.value || null;
    pageState.page = 1;
    debouncedLoadPage();
  }
})
//removes the search using close button
mainContent.addEventListener("click",e=>{
  const closeButton = e.target.closest(".search-result img");
  if(!closeButton) return;
  pageState.search = null;
  debouncedLoadPage();
})

//genre filter more button
const moreTags = document.querySelectorAll(".side-bar .tags-btn.more-tags")
const moreBtn = document.querySelector(".moreBtn");
moreBtn.addEventListener("click",()=>{
  moreTags.forEach(tag =>{
    tag.style.display = "flex"
  })
  moreBtn.style.display = "none"
})

//pagination buttons
nextBtn.forEach(next=>{
  next.addEventListener("click", () => {
  if(pageState.page === lastPage){
    return;
  }
  pageState.page = Number(pageState.page) + 1;
  debouncedLoadPage();
  });
});
backBtn.forEach(back=>{
  back.addEventListener("click", () => {
  if (pageState.page > 1) {
    pageState.page = pageState.page - 1;
    debouncedLoadPage();
  }
} );
});

//logo click
const webLogo = document.querySelector(".menu .container");
webLogo.addEventListener("click",()=> {
  genreBtns.forEach(e => e.classList.remove("active"));
  pageState.genre = null;
  pageState.search = null;
  debouncedLoadPage();
});

//featured filter
topfilterOptions.forEach(filterTop =>{
  filterTop.addEventListener("click",()=>{
    genreBtns.forEach(e => e.classList.remove("active"));
    pageState.topFilter.value = filterTop.dataset.value;
    pageState.topFilter.name = filterTop.dataset.name;
    pageState.page = 1;
    pageState.genre = null;
    pageState.search = null;
    debouncedLoadPage();
  })
})

//order by filter
orderfilterOptions.forEach(filterOrder =>{
  filterOrder.addEventListener("click",()=>{
    pageState.orderFilter = filterOrder.dataset.value;
    pageState.page = 1;
    debouncedLoadPage();
  })
})

////load the items on load and refresh
debouncedLoadPage();

//loadPage for all fetch
async function loadPage() {

  if (isLoading) return;
  isLoading = true;

  try {
    //Returns page name based on the values in the pageState object
  function pageName(){
    if(pageState.genre && !pageState.search){
      return "genrePage"
    }
    else if(!pageState.genre && pageState.search){
      return "searchPage"
    }
    else if(pageState.genre && pageState.search){
      return "genreSearchPage"
    }
    return;
  }

  //search results
  function searchResult(){
    if(mainContent.querySelector(".search-result")) mainContent.removeChild(mainContent.querySelector(".search-result"));
    const searchResults = document.createElement("div");
    const searchResultsText = document.createElement("p");
    const closeButton = document.createElement("img");
    anilist.children.length === 0 && pageState.search ? searchResultsText.innerText = `No results found for: \"${pageState.search}\" `
    :searchResultsText.innerText = "search results for: \""+pageState.search+"\"";
    closeButton.src = "./assets/images/close-dark.svg";
    closeButton.setAttribute("data-dark","./assets/images/close-light.svg");
    closeButton.setAttribute("data-light","./assets/images/close-dark.svg");
    searchResults.classList.add("search-result");
    searchResults.appendChild(searchResultsText);
    searchResults.appendChild(closeButton);
    mainContent.insertBefore(searchResults, thirdChild);
    searchField.value = "";
    animfilter.style.display = "block";
    if(localStorage.getItem("theme") === "dark") loadTheme(true);
    else loadTheme(false);
    return;
  }
  
  const activePage = pageName() || "default"
  const page = pageState.page;

  console.log("current state search="+pageState.search + " genre="+pageState.genre+" page="+page);
  console.log("current page: "+activePage);
  console.log("top: "+pageState.topFilter.value +" order: "+pageState.orderFilter)

  //returns fetch based on the active page
  function checkPage(element){
    switch(element){
      //genre page
      case "genrePage":
        if(mainContent.querySelector(".search-result")) mainContent.removeChild(mainContent.querySelector(".search-result"));
        header.innerText = pageState.genre[0].toUpperCase()+pageState.genre.slice(1)+" Anime List";
        btn_txtTop.innerText = "Featured List";
        animfilter.style.display = "block";
        return fetch(`https://anime-array.vercel.app/api/animes?genres=${pageState.genre}&page=${page}&order=${pageState.orderFilter}`);

      //search page
      case "searchPage":
        header.innerText = "Search Anime";
        btn_txtTop.innerText = "Featured List";
        searchResult();
        return fetch(`https://anime-array.vercel.app/api/animes?q=${pageState.search}&page=${page}&order=${pageState.orderFilter}`)

      //search and genre
      case "genreSearchPage":
        btn_txtTop.innerText = "Featured List";
        searchResult();
        return fetch(`https://anime-array.vercel.app/api/animes?q=${pageState.search}&genres=${pageState.genre}&page=${page}&order=${pageState.orderFilter}`)

      //default page
      default:
        header.innerText = pageState.topFilter.name+" List";
        if(mainContent.querySelector(".search-result")) mainContent.removeChild(mainContent.querySelector(".search-result"));
        searchField.value = "";
        animfilter.style.display = "none";
        return fetch(`https://anime-array.vercel.app/api/animes/featured?page=${page}&filter=${pageState.topFilter.value}`,{method: 'GET'});
    }
  }

  pageNum.forEach(eachpage=>{
    eachpage.innerText = page;
  })
  anilist.innerHTML = "";
  skeletonShimmerloading(4);

  try {
    const res = await checkPage(activePage);
    const data = await res.json();
    //displaying the rate limiting error from backend
    if (!res.ok) {
    console.error("API error:", data.error || data);
    return;
    }

    if (!data.pagination) {
      console.error("Pagination is missing:", data);
      return;
    }

    

    anilist.innerHTML = "";
    anilist.classList.remove("skeleton");
    lastPage = data.pagination.last_visible_page;
    currentPage = data.pagination.current_page;
    // console.log(`the current page is: ${currentPage}`)

    data.data.forEach(anime => {
      const card = document.createElement("div");
      const image_wrapper = document.createElement("div");
      // const bookmark = document.createElement("img");
      const thumbnail = document.createElement("img");

      
      const statusSpan = document.createElement("span");
      const epsSpan = document.createElement("span");
      const details = document.createElement("div");
      const details_list = document.createElement("ul");
      const title = document.createElement("li");
      const episodes = document.createElement("li");
      const status = document.createElement("li");
      const genre = document.createElement("li");
      const genreDiv = document.createElement("div");

      statusSpan.classList.add("status-span");
      epsSpan.classList.add("episodes-span");
      card.classList.add("list-item","toggle");
      card.setAttribute("id",anime.mal_id);
      image_wrapper.classList.add("image-wrapper")
      // bookmark.classList.add("bookmark-btn")
      thumbnail.classList.add("item-img");
      genreDiv.classList.add("genre-container");

      details.classList.add("details")
      title.classList.add("anime-title");
      episodes.classList.add("anime-episodes");
      status.classList.add("anime-status");
      genre.classList.add("anime-genre");

      epsSpan.innerText = "Episodes: ";
      statusSpan.innerText = "Status: ";

      
      const animTitle =  anime.titles[0].title || anime.titles[1].title;
      
      // bookmark.src = anilist.classList.contains("dark-mode") ? "assets/images/booklight.svg" : "assets/images/bookdark.svg";
      thumbnail.src = anime.images.jpg.image_url || anime.images.webp.image_url;
      title.innerText = animTitle.length > 49 ? animTitle.slice(0, 49)+"...": animTitle;
      // title.innerText = anime.titles[0].title || anime.titles[1].title;
      episodes.appendChild(epsSpan);
      episodes.append((anime.episodes || "No episodes yet"))
      
      status.appendChild(statusSpan);
      status.append(anime.status);
      // genre.innerText = (anime.genres.length > 3 ? anime.genres.slice(0,3).map(genre => genre["name"]).join(",") : anime.genres.map(genre => genre["name"]).join(","));
      anime.genres.slice(0,3).forEach(genre =>{
        const genreItem = document.createElement("p");
        genreItem.classList.add("genre-item");
        genreItem.innerText = genre.name;

        genreDiv.appendChild(genreItem);
      })


      card.appendChild(image_wrapper);
      card.appendChild(details);
      if(animTitle.length > 49) {
        const tooltip = document.createElement("span");
        tooltip.classList.add("tooltip-title");
        tooltip.innerText = animTitle;
        card.appendChild(tooltip);
      }
      

      // image_wrapper.appendChild(bookmark);
      image_wrapper.appendChild(thumbnail);
      // image_wrapper.appendChild(tooltip);

      details.appendChild(details_list);
      details_list.appendChild(title);
      // details_list.appendChild(tooltip);
      details_list.appendChild(episodes);
      details_list.appendChild(status);
      genre.appendChild(genreDiv);
      details_list.appendChild(genre);

      anilist.appendChild(card);
    });
  } 
  catch (err) {
    anilist.innerHTML = `
    <div class="loading-failed toggle">
        <p>List Failed to load, try again later</p>
        <img src="./assets/images/reloaddark.svg" data-dark="./assets/images/reloadwhite.svg" data-light="./assets/images/reloaddark.svg" alt="reload image">
    </div>`;
    if(localStorage.getItem("theme") === "dark") loadTheme(true);
    else loadTheme(false);
    console.error(err);
  }
  if(anilist.children.length === 0 && pageState.search) searchResult();

  }
  finally {
    isLoading = false;
  }
}

//Skeleton element with shimmer animation
function skeletonShimmerloading(count){
  for(let x = 0; x < count ;x++){
    const skeleton = document.createElement("div");
    skeleton.className = "skeleton"

    skeleton.innerHTML = `<div class="image-wrapper">
                            <img class="item-img" src="./assets/images/Logo.svg" alt="item-picture">
                            
                        </div>
                        
                        <div class="details">
                            <ul>
                                <li class="anime-title">[Title]</li>
                                <li class="anime-episodes">[Episodes]</li>
                                <li class="anime-status">[Status]</li>
                                <li class="anime-genre">[Genres]</li>
                            </ul>
                        </div>`

    anilist.appendChild(skeleton);
  }
}

////////////////////////////////////////////////////////////////////////////////////JS for UI

const select_btn = document.querySelector(".select-btn.order");
const items = document.querySelector(".filters .dropdown-menu.order");
const dropdown = document.getElementById("orderByDropdown");
const btn_txt = dropdown.querySelector(".btn-order");

const itemsTop = document.querySelector(".filters .dropdown-menu.top");


const bodyEl = document.querySelector("body");

//toggle
const darkmodeBtn = document.querySelector(".toggle-container .toggle-btn");

//top filter
select_btnTop.addEventListener("click",()=>{
    const isOpen = itemsTop.style.display === "block";
    itemsTop.style.display = isOpen ? "none" : "block";

    select_btnTop.classList.toggle("isOpen", !isOpen);
})

itemsTop.addEventListener("click", e =>{
  
  const clicked = e.target.closest('.dropdown-item.top');
  if (clicked) {
    const val = clicked.textContent.trim();
    btn_txtTop.textContent = val;

    itemsTop.style.display = "none";
    select_btnTop.classList.remove("isOpen");
  }
})


select_btn.addEventListener("click",()=>{
    const isOpen = items.style.display === "block";
    items.style.display = isOpen ? "none" : "block";

    select_btn.classList.toggle("isOpen", !isOpen);
})

items.addEventListener("click", e =>{
  
  const clicked = e.target.closest('.dropdown-item.order');
  if (clicked) {
    const val = clicked.textContent.trim();
    btn_txt.textContent = "Order by: "+val;

    items.style.display = "none";
    select_btn.classList.remove("isOpen");
  }
})

//clicking outside of the menu filter options
document.addEventListener("click", (e) => {
  if (!dropdown.contains(e.target)) {
    items.style.display = "none";
    select_btn.classList.remove("isOpen");
  }
});

document.addEventListener("click", (e) => {
  if (!dropdownTop.contains(e.target)) {
    itemsTop.style.display = "none";
    select_btnTop.classList.remove("isOpen");
  }
});

function getTheme(){
  return localStorage.getItem("theme");
}

darkmodeBtn.addEventListener("click",()=>{
  const theme = getTheme();

  if(theme === "dark"){
    localStorage.removeItem("theme");
    loadTheme(false);
  }
  else{
    localStorage.setItem("theme","dark");
    loadTheme(true);
  }
})

//loader every refresh
if(localStorage.getItem("theme") === "dark") loadTheme(true);
else loadTheme(false);

function loadTheme(state){

  const black = "#121212";
  const white = "#FFFFFF";
  // const backgroundBlack = "#232323"
  // const backgroundWhite = "#f0f0f0"


  const bgChange = document.querySelectorAll(".toggle");
  bgChange.forEach(e=> {
    e.classList.toggle("dark-mode",state)
    e.classList.toggle("active",state)
    e.style.color = state ? white : black;
  });

  const hoverBg = document.querySelectorAll(".hover");
  hoverBg.forEach(e=>{
    e.classList.toggle("dark-mode", state);
  })

  const logo = document.querySelectorAll(".dropdown-list .dropdown-item .toggle");
  logo.forEach(e=>{
    e.style.color = state ? black : white;
  })

  

  darkmodeBtn.src = state ? "assets/images/toggle-on-solid-full.svg" : "assets/images/toggle-off-solid-full.svg";

  

  bodyEl.style.backgroundColor = state ? black : white;
  bodyEl.style.color = state ? white : black;

  //changes the images with data-alt property when dark mode is toggled
  document.querySelectorAll("img[data-dark][data-light]").forEach(img =>{
    img.src = state ? img.dataset.dark : img.dataset.light;
  });

}


//logo hover
const footerLogos = document.querySelectorAll(".footer-links .social-links img");

footerLogos.forEach(e=>{
  e.addEventListener("mouseover",()=>{
    if(e.src.includes("faceshadow.svg")){
      e.src = "assets/images/facedark.svg"
    }
    else if(e.src.includes("linkshadow.svg")){
      e.src = "assets/images/linkdark.svg"
    }
    else if(e.src.includes("gitshadow.svg")){
      e.src = "assets/images/gitdark.svg"
    }

    else if(e.src.includes("linklight.svg")){
      e.src = "assets/images/linkwhite.svg"
    }
    else if(e.src.includes("gitlight.svg")){
      e.src = "assets/images/gitwhite.svg"
    }
    else if(e.src.includes("facelight.svg")){
      e.src = "assets/images/facewhite.svg"
    }
  })

  e.addEventListener("mouseout",()=>{
    if(e.src.includes("facedark.svg")){
      e.src = "assets/images/faceshadow.svg"
    }
    else if(e.src.includes("linkdark.svg")){
      e.src = "assets/images/linkshadow.svg"
    }
    else if(e.src.includes("gitdark.svg")){
      e.src = "assets/images/gitshadow.svg"
    }

    else if(e.src.includes("linkwhite.svg")){
      e.src = "assets/images/linklight.svg"
    }
    else if(e.src.includes("gitwhite.svg")){
      e.src = "assets/images/gitlight.svg"
    }
    else if(e.src.includes("facewhite.svg")){
      e.src = "assets/images/facelight.svg"
    }
  })
  
})