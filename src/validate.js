module.exports =  {
  params:{
    private: new RegExp(/^_[\w\s]*/)
  },
  where: [{
    type: "REGEXP",
    regex: new RegExp(/^\/[\w\s]*\/$/)
  },{
    type: "OR",
    regex: new RegExp(/^\[or\][\w\s]*/)
  },{
    type: "IN",
    regex: new RegExp(/^\[[\w\s\,]*\]$/)
  },{
    type: "GTE",
    regex: new RegExp(/^>=[\w\s]*/)
  },{
    type: "GT",
    regex: new RegExp(/^>[\w\s]*/)
  },{
    type: "LTE",
    regex: new RegExp(/^<=[\w\s]*/)
  },{
    type: "LT",
    regex: new RegExp(/^<[\w\s]*/)
  },{
    type: "GENERAL",
    regex: new RegExp(/./)
  }]
}
