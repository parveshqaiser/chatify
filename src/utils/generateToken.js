
import crypto from "node:crypto";

export let generateTemporaryToken = ()=>{

    let unhashedToken = crypto.randomBytes(10).toString("hex");
    let hashedToken = crypto.createHash("sha256").update(unhashedToken).digest("hex");

    let tokenExpiry = Date.now() +(5*60*1000);

    return {unhashedToken,hashedToken, tokenExpiry};
}
