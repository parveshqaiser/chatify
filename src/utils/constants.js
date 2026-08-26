
export let allowedDomains = ["@gmail.com", "@hotmail.com", "@yahoo.com"];

export let generateDate =()=>{
    return new Date().toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata"
    });
}
