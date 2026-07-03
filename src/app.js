import express, { urlencoded } from "express";
import cors from "cors";
import dbConnection from "./config/db.js";

let app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(cors({
    origin : "*",
    methods : ["GET", "POST", "PUT", "PATCH","DELETE"],
    credentials : true,
    allowedHeaders : ["Content-Type", "Authorization"]
}));


let PORT = 5555 ?? 2222;

app.get("/", (req, res)=>{
    res.status(200).json({
        message : "Hello Parvesh, server is up running at port no ******",
        success : true
    })
});

app.use((req, res) => {
    res.status(404).json({
        message: "No Such Route found",
        success: false
    });
});


dbConnection().then(()=>{
    console.log("DB connected");

    app.listen(PORT, ()=>{
        console.log(`Server is up at http:localhost:${PORT}`);
    });
}).catch(err =>{
    console.log("Some Error in connecting DB");
    process.exit(1);  
    //if there is error , deestablish the connection or exit the connection
})

