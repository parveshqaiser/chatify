
export let allowedDomains = ["@gmail.com", "@hotmail.com", "@yahoo.com"];

export let generateDate =()=>{
    return new Date().toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata"
    });
}
