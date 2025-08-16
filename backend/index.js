import express from "express"
import axios from "axios";

const app = express();
app.get("/:token", async function(req,res){ //route parameter;

  // Getting the todays UTC timestamp
  const date = new Date();
  let stockDataBACKPACK;
  let stockDataBINANCE;


  
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth();
  const currentDate = date.getDate();
  const UTC = Date.UTC(currentYear, currentMonth, currentDate, 0, 0, 0, 0); // .UTC is a staic method bhai date jo hai woh instance hai toh usse call nai kar sakte hum usko i.e, need to use Date.UTC only
  //yeh milliiseconds mein dega bhai
  
  
  //data to pass in backpack API -- mostly same only
  const endTime = (UTC)/1000; // to convert it into seconds 
  const startTime = endTime - (30*24*60*60); //subtracting 30days ka sec
  const interval = "1d";
  const symbol = req.params.token;

  //backpack -- expects seconds and binance millisec

  console.log(startTime);
  console.log(endTime);

  const binanceEndTime = endTime*1000;
  const binanceStartTime = startTime*1000;

  //hitting the BackPAck API
  axios.get(`https://api.backpack.exchange/api/v1/klines?symbol=${symbol}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`)
    .then(function(response){
      // const length = response.data.length
      // console.log(length);
      // console.log(response.data);
      stockDataBACKPACK = response.data;
      console.log(stockDataBACKPACK.length);
      console.log(stockDataBACKPACK);

      

    })

    axios.get(`https://api.binance.com/api/v3/klines?symbol=SOLUSDC&interval=1d&startTime=${binanceStartTime}&endTime=${binanceEndTime}`)
    .then(function(response){
      stockDataBINANCE = response.data;
      console.log(stockDataBINANCE.length);
      console.log(stockDataBINANCE);
            
    })





})



  
    


app.listen(3000, function(){
    console.log("Listening on Port", 3000);
})

