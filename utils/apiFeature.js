const appError = require("./appError");

class APIfeatures{
      constructor(query,queryString){
      this.query=query;
      this.queryString=queryString;
    }
  
    filtering(){
      //NORMAL FILTERING 
      const hardCopyQueryObj={...this.queryString};
      const filtering=['page','sort','limit','fields']
      filtering.forEach(el => delete hardCopyQueryObj[el]);
  
      console.log(this.queryString,hardCopyQueryObj);
   // ADVANCED FILTERING
      const queryStr=JSON.stringify(hardCopyQueryObj);
     const newStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g,match => `$${match}`);
     console.log(JSON.parse(newStr));
  
    this.query = this.query.find(JSON.parse(newStr));
  
    return this;
    }
  
    sorting(){
      if(this.queryString.sort){
       const sortBy=this.queryString.sort.split(',').join(' ');
       this.query=this.query.sort(sortBy);
      }else{
        this.query = this.query.sort('-createdAt')
      }
    return this;
    }
  
    limitingFields(){
       if(this.queryString.fields){
        const fields=this.queryString.fields.split(',').join(' ');  
       this.query = this.query.select(fields);
       }else{
        this.query = this.query.select('-__v');
       }
       return this;
    }
    pagination =async()=>{
        const page = this.queryString.page * 1 || 1;
      const l = this.queryString.limit * 1 || 100;
      const skip = (page - 1) * l;
  
      //  console.log('look at the query :',this.query.getQuery());
      //  if(this.queryString.page){
      //   console.log(skip,l);
      //   const numTours=await this.query.countDocuments();
      //   if(skip>=numTours)return new appError('this page doesnot exist',404);
      //  }
       this.query = this.query.skip(skip).limit(l);
  
       return this;
    
  }
}

  module.exports=APIfeatures;