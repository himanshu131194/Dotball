const express = require('express');
const https = require('https');
const requestPromise = require('request-promise');
const {API_URL, KEY, REDIS_URL, REDIS_EXPIRE} = require('./config');
const redis = require('redis');
const util = require('util');
const client = redis.createClient(REDIS_URL);
client.get = util.promisify(client.get);
app = express();

let movieInfo='';
let keys = [];

for(x in process.argv){
   if(x==2){
      movieInfo += `t=${process.argv[x].toString()}`;
      keys.push(movieInfo);
   }
   if(x==3){
      movieInfo += `&y=${process.argv[x].toString()}`;
      keys.push(movieInfo);
   }
}


(async ()=>{
    //CHECK VALUE IS IN REDIS
    let cacheValue;
    for(x in keys){
        cacheValue = await client.get(keys[x]);
        if(cacheValue) break;
    }
    if(cacheValue){
         //IF YES GET FROM REDIS
        console.log("Data from Radis");
        console.log(JSON.parse(cacheValue));
    }else{
        //NO, GET FROM API AND UPDATE REDIS
        try {
          let request = await requestPromise(`${API_URL}?${movieInfo}&apikey=${KEY}`)
              client.set(movieInfo, JSON.stringify(request), "EX", REDIS_EXPIRE);
              console.log(JSON.parse(request));
        } catch (e) {
              console.log(e.message);
        }
    }
})();
