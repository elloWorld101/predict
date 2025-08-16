import express from "express"
import axios from "axios";
import cors from "cors"

const app = express();
app.use(cors());
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
//   console.log(`${symbol}_USDC`);
//   console.log(`${symbol}USDC`);

  //hitting the BackPAck API
  axios.get(`https://api.backpack.exchange/api/v1/klines?symbol=${symbol}_USDC&interval=${interval}&startTime=${startTime}&endTime=${endTime}`)
    .then(function(response){
      // const length = response.data.length
      // console.log(length);
      // console.log(response.data);
      stockDataBACKPACK = response.data;
      console.log(stockDataBACKPACK.length);
      console.log(stockDataBACKPACK);

      // --- Extract closes and volumes into arrays ---
    var closes = []; //day to day price closes array
    var volumes = []; // day to day volumes
    for (var i = 0; i < stockDataBACKPACK.length; i++) { //populating the arrays
        closes[i] = parseFloat(stockDataBACKPACK[i].close);
        volumes[i] = parseFloat(stockDataBACKPACK[i].volume);
    }

    // --- Calculate 30-day SMA ---
    var sma30 = [];
    console.log(closes.length);
    for (var i = 29; i < closes.length; i++) { //what if I remove the 1st for loop
        var sum = 0;
        for (var j = i - 29; j <= i; j++) {
            sum += closes[j];
        }
        sma30[i] = sum / 30;
    }

    // --- Calculate RSI 14 ---
    var rsi = [];
    var gains = 0;
    var losses = 0;

    // First 14 days
    for (var i = 1; i <= 14; i++) {
        var diff = closes[i] - closes[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
    }

    var avgGain = gains / 14;
    var avgLoss = losses / 14;
    rsi[14] = 100 - 100 / (1 + avgGain / (avgLoss || 1));

    // Remaining days
    for (var i = 15; i < closes.length; i++) {
        var diff = closes[i] - closes[i - 1];
        var gain = diff > 0 ? diff : 0;
        var loss = diff < 0 ? -diff : 0;

        avgGain = (avgGain * 13 + gain) / 14;
        avgLoss = (avgLoss * 13 + loss) / 14;

        rsi[i] = 100 - 100 / (1 + avgGain / (avgLoss || 1));
    }

    // --- Last day analysis ---
    var lastIndex = closes.length - 1;
    var lastClose = closes[lastIndex];
    var lastSMA = sma30[lastIndex];
    var lastRSI = rsi[lastIndex];

    // --- Average volume for 30 days ---
    var volSum = 0;
    for (var i = lastIndex - 29; i <= lastIndex; i++) {
        volSum += volumes[i];
    }
    var avgVol = volSum / 30;
    var lastVol = volumes[lastIndex];

    // --- Output ---
    // console.log("Last Close:", lastClose);
    // console.log("30-day SMA:", lastSMA.toFixed(2));
    // console.log("RSI:", lastRSI.toFixed(2));
    // console.log("Last Volume:", lastVol);
    // console.log("Average Volume:", avgVol.toFixed(2));

    if(lastClose > lastSMA){
        // console.log("Bullish");
        // console.log("Long");
        res.json({ //Price above SMA 
            trend : "Bullish",
            suggestion: "Long"
        })
    } 
    else {
        res.json({ //Price below SMA 
            trend : "Bearish",
            suggestion: "Short"
        })
    }

    // if(lastRSI > 70) console.log("RSI overbought → potential sell");
    // else if(lastRSI < 30) console.log("RSI oversold → potential buy");
    // else console.log("RSI neutral");

    // if(lastVol > avgVol * 1.5) console.log("Volume spike detected");
      

    
      

    })

    // axios.get(`https://api.binance.com/api/v3/klines?symbol=${symbol}USDC&interval=1d&startTime=${binanceStartTime}&endTime=${binanceEndTime}`)
    // .then(function(response){
    //   stockDataBINANCE = response.data;
    //   console.log(stockDataBINANCE.length);
    //   console.log(stockDataBINANCE);
      
    //   // --- Extract closes and volumes into arrays ---
    // var closes = [];
    // var volumes = [];
    // for (var i = 0; i < stockDataBINANCE.length; i++) {
    //     closes[i] = parseFloat(stockDataBINANCE[i][4]);
    //     volumes[i] = parseFloat(stockDataBINANCE[i][5]);
    // }

    // // --- Calculate 30-day SMA ---
    // var sma30 = [];
    // for (var i = 29; i < closes.length; i++) {
    //     var sum = 0;
    //     for (var j = i - 29; j <= i; j++) {
    //         sum += closes[j];
    //     }
    //     sma30[i] = sum / 30;
    // }

    // // --- Calculate RSI 14 ---
    // var rsi = [];
    // var gains = 0;
    // var losses = 0;

    // // First 14 days
    // for (var i = 1; i <= 14; i++) {
    //     var diff = closes[i] - closes[i - 1];
    //     if (diff >= 0) gains += diff;
    //     else losses -= diff;
    // }

    // var avgGain = gains / 14;
    // var avgLoss = losses / 14;
    // rsi[14] = 100 - 100 / (1 + avgGain / (avgLoss || 1));

    // // Remaining days
    // for (var i = 15; i < closes.length; i++) {
    //     var diff = closes[i] - closes[i - 1];
    //     var gain = diff > 0 ? diff : 0;
    //     var loss = diff < 0 ? -diff : 0;

    //     avgGain = (avgGain * 13 + gain) / 14;
    //     avgLoss = (avgLoss * 13 + loss) / 14;

    //     rsi[i] = 100 - 100 / (1 + avgGain / (avgLoss || 1));
    // }

    // // --- Last day analysis ---
    // var lastIndex = closes.length - 1;
    // var lastClose = closes[lastIndex];
    // var lastSMA = sma30[lastIndex];
    // var lastRSI = rsi[lastIndex];

    // // --- Average volume for 30 days ---
    // var volSum = 0;
    // for (var i = lastIndex - 29; i <= lastIndex; i++) {
    //     volSum += volumes[i];
    // }
    // var avgVol = volSum / 30;
    // var lastVol = volumes[lastIndex];

    // // --- Output ---
    // // console.log("Last Close:", lastClose);
    // // console.log("30-day SMA:", lastSMA.toFixed(2));
    // // console.log("RSI:", lastRSI.toFixed(2));
    // // console.log("Last Volume:", lastVol);
    // // console.log("Average Volume:", avgVol.toFixed(2));

    // if(lastClose > lastSMA) {    
    //     res.json({ //Price above SMA 
    //         trend: "Bullish",
    //         suggestion: "Long"
    //     })
    // }
    // else {
    //     res.json({ //Price below SMA
    //         trend: "Bearish",
    //         suggestion: "Short"
    //     })
    // }
    

    // // if(lastRSI > 70) console.log("RSI overbought → potential sell");
    // // else if(lastRSI < 30) console.log("RSI oversold → potential buy");
    // // else console.log("RSI neutral");

    // // if(lastVol > avgVol * 1.5) console.log("Volume spike detected");


    // })






})



  
    


app.listen(3000, function(){
    console.log("Listening on Port", 3000);
})

