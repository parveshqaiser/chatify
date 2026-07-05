
export const checkInputValidation = (...fields)=>{
    
    for (let item of fields){
        if(!item?.trim()){
               console.log("going here 2")
            return "All Input Fields Required"
        }
    }
}