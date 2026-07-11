
import crypto from "node:crypto";

export let generateEmailVerificationToken = ()=>{

    let unhashedToken = crypto.randomBytes(10).toString("hex");
    let hashedToken = crypto.createHash("sha256").update(unhashedToken).digest("hex");

    let tokenExpiry = Date.now() +(5*60*1000);  // 5 mins

    return {unhashedToken,hashedToken, tokenExpiry};
}
