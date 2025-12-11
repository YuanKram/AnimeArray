const express = require('express');
const cors = require('cors')
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');


const app = express();
app.use(cors({
  origin: 'https://yuankram.github.io'
}));

//request rate limit for seconds, max 3 request per second 
const secondLimit = rateLimit({
  windowMs: 1000,
  max: 3,
  message: {
    status: 429,
    error: "too many request! 3 requests is the maximum per second"
  }
})
//request rate limit for minutes, max 60 request per minute 
const minuteLimit = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: {
    status: 429,
    error: "too many request! 60 requests is the maximum per minute"
  }
});

//rate-limit is used globally on every app route
app.use(secondLimit);
app.use(minuteLimit);

//using the Node cache class and assigning it two cache object
const cache = new NodeCache({ stdTTL: 7200 }); //changed to 2 hours because of Jikan requests restrictions

//API
//https://api.jikan.moe/v4

//load default items list
//with featured filter
app.get('/api/animes/featured', async (req, res) => {
  const page = req.query.page || 1;
  const filter = req.query.filter;

  const cacheKey = `anime:${filter}_page_${page}`; //setting the unique cache key
  const cacheData = cache.get(cacheKey); //getting the value of the unique cache key
  //checking if cacheData exist then proceeds to return cached Data instead of the API
  if(cacheData){
    console.log("Returning API data from Cache...");
    return res.json(cacheData);
  }; //this will return cache data instead of fetching the API data again if the cache data exists

  if(filter === "topAnime"){
    try {
    console.log("fetching new data from Jikan API")
    const response = await fetch(`https://api.jikan.moe/v4/top/anime?page=${page}&sfw=true`);
    const data = await response.json();

    console.log("storing the data to cache...");
    cache.set(cacheKey, data); //this will store the fetched data to cache
    console.log("returning list from API request...");
    return res.json(data);

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch seasonal anime' });
    }
  }

  else if(filter === "seasonalAnime"){
    try {
    console.log("fetching new data from Jikan API")
    const response = await fetch(`https://api.jikan.moe/v4/seasons/now?page=${page}&sfw=true`);
    const data = await response.json();

    console.log("storing the data to cache...");
    cache.set(cacheKey, data); //this will store the fetched data to cache
    console.log("returning list from API request...");
    return res.json(data);

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch seasonal anime' });
    }
  }

  // else if(filter === "latestAnime"){
  //   try {
  //   console.log("fetching new data from Jikan API")
  //   const response = await fetch(`https://api.jikan.moe/v4/watch/episodes`);
  //   const data = await response.json();

  //   console.log("storing the data to cache...");
  //   cache.set(cacheKey, data); //this will store the fetched data to cache
  //   console.log("returning list from API request...");
  //   return res.json(data);

  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).json({ error: 'Failed to fetch seasonal anime' });
  //   }
  // }

});

//combination of search and genres filter
//more cleaner than singles routes for every queries and can add more queries based on the API
app.get('/api/animes', async(req,res)=>{
  const {q , genres , page, order} = req.query;
  
  //checking if the q and genres queries exist
  const filters = {};
  if(q && !genres) filters.q = q.toLowerCase();
  else if(!q && genres) filters.genres = genres;
  else if(q && genres){
    filters.q = q.toLowerCase();
    filters.genres = genres;
  }

  //caching the genreList
  let genreCacheList = cache.get("genre_list")
  const getGenreList = async()=>{
    const response = await fetch("https://api.jikan.moe/v4/genres/anime");
    const data = await response.json();

    genreCacheList = {}
    data.data.forEach(e=>{
      genreCacheList[e.name.toLowerCase()] = e.mal_id;
    })
    console.log("caching the genre list for 24 hours...")
    cache.set("genre_list",genreCacheList, 86400);
  }

  //three fetches
  //search
  if(filters.hasOwnProperty("q") && !filters.hasOwnProperty("genres")){

    const cacheKey = `anime_title:${filters.q}_page:${page}_order:${order}`;
    const cacheData = cache.get(cacheKey);

    if(!cacheData){
      try {
      const response = await fetch(`https://api.jikan.moe/v4/anime?q=${filters.q}&sfw=true&page=${page}&orderBy=${order}`);
      const data = await response.json();
      
      console.log("caching the data...")
      cache.set(cacheKey, data);
      console.log("returning list from API request...")
      return res.json(data);
      } 
      catch (err) {
      console.error(err);
      res.status(500).json({error:"unable to get list on searches"});  
      }
    }
    console.log("returning list from cache...")
    return res.json(cacheData);
    
  }

  //filter genre
  else if(!filters.hasOwnProperty("q") && filters.hasOwnProperty("genres")){
    if(!genreCacheList) await getGenreList();
    const genId = genreCacheList[genres];

    const cacheKey = `genre:${genId}_page:${page}_order:${order}`;
    const cacheData = cache.get(cacheKey);

    if(!cacheData){
      try {
      console.log(order+page+genId)
      const response = await fetch(`https://api.jikan.moe/v4/anime?genres=${genId}&page=${page}&order_by=${order}&sfw=true`);
      const data = await response.json();
      
      console.log("caching genre filter list...")
      cache.set(cacheKey, data);
      console.log("returning list from API request...")
      return res.json(data);
      } 
      catch (err) {
      console.error(err);
      res.status(500).json({error:"unable to get list on genres"}); 
      }
    }
    console.log("returning list from cache...");
    return res.json(cacheData);

  }

  //search w/ genre filter
  else if(filters.hasOwnProperty("q") && filters.hasOwnProperty("genres")){
    if(!genreCacheList) await getGenreList();
    const genId = genreCacheList[genres];

    const cacheKey = `anime_title:${filters.q}_genre:${genId}_page:${page}_order:${order}`;
    const cacheData = cache.get(cacheKey);
    if(!cacheData){
      try {
      const response = await fetch(`https://api.jikan.moe/v4/anime?genres=${genId}&q=${filters.q}&page=${page}&orderBy=${order}&sfw=true`);
      const data = await response.json();
      
      console.log("caching title genre list...")
      cache.set(cacheKey, data);
      console.log("returning list from API request...")
      return res.json(data);
      } 
      catch (err) {
      console.error(err);
      res.status(500).json({error:"unable to get list on searches and genres"});  
      }
    }
    console.log("returning list from cache...")
    return res.json(cacheData);
  }
})

//item page description
app.get("/anime/details/:id",async (req, res)=>{
  const itemID = req.params.id;
  
  const cacheKey = `anime_details:${itemID}`
  const cacheData = cache.get(cacheKey);

  if(!cacheData){
    try {
    console.log("fetching anime details of "+ itemID);
    const response = await fetch(`https://api.jikan.moe/v4/anime/${itemID}/full`);
    const data = await response.json();
    
    cache.set(cacheKey, data);
    console.log("returning details of id: "+itemID+" from the API fetch")
    return res.json(data);

    }
    catch (err) {
    console.error(err);
    res.status(500).json({error: "failed to fetch the anime details"})
    }
  }

  console.log("returning of item id :"+itemID +" from cache....")
  res.json(cacheData); //returning from cache
  });

const port = process.env.PORT || 3000;
app.listen(port, ()=>{ console.log(`Backend running at port: ${port}`)});


