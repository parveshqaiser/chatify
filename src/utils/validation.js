
export const checkInputValidation = (...fields)=>{
    
    for (let item of fields){
        if(!item?.trim()){
            return "All Input Fields Required"
        }
    }
}