const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// frontend folder connect
app.use(express.static(path.join(__dirname,"../Public")));

app.get("/places",(req,res)=>{

const places = [
{ name:"Dumas Beach", city:"Surat"},
{ name:"Statue of Unity", city:"Kevadia"},
{ name:"Gir National Park", city:"Junagadh"}
]

res.json(places)

})

app.listen(3000,()=>{
console.log("Server running on port 3000")
})