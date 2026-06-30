import express from "express";
import cors from "cors";

let app = express();

app.use(express.json());

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


app.listen(PORT, ()=>{
    console.log(`Server is up at http:localhost:${PORT}`);
})