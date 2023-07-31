const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app=express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

var day="";
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemsSchema={
  name:String
};

const Item=mongoose.model("item",itemsSchema);

const item1=new Item({
  name:"Welcome to ur to do list"
});
const item2=new Item({
  name:"Hit the + button to add a new item."
});
const item3=new Item({
  name:"<--Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
}

const List=mongoose.model("list",listSchema);

app.get("/",function(req,res){
  var today=new Date();
  var options={
     weeday:"long",
     day:"numeric",
     month:"long"
  }
  var day=today.toLocaleDateString("en-US",options);

  Item.find({})
  .then((data)=>{
    if(data.length === 0)
    {
    Item.insertMany(defaultItems)
      .then(function () {
        console.log("Successfully saved defult items to DB");
      })
      .catch(function (err) {
        console.log(err);
      });
      res.redirect("/");
    }
    else
    res.render("list", { day:day,val: data});
  })
  .catch((err)=>console.log(err));
});

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName})
  .then((foundlist)=>{
    if(!foundlist){
      const list=new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
    }
    else{
      res.render("list",{ day:customListName,val: foundlist.items});
    }
  })
  .catch((err)=>{
    console.log(err);
})
});

app.post("/",function(req,res){
 const itemName=req.body.work;
 const listname=req.body.button;
 const item=new Item({
  name:itemName
});
if(listname === day)
{
 item.save();
 res.redirect("/");
}
else{
  List.findOne({name:listname})
  .then((foundlist)=>{
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+listname);
  })
  .catch((err)=>{
    console.log(err);
})
}
});

app.post("/delete",function(req,res){
  const selected_id=req.body.checkbox;
  const listName=req.body.listname;

  if(listName===day)
  {
    Item.findByIdAndRemove(selected_id)
    .then(function(){
      console.log("successfull");
      res.redirect("/")
    })
    .catch(function(err){
      console.log(err);
    });
  }
  else
  {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:selected_id}}})
    .then((founlist)=>{
      res.redirect("/"+listName);
    })
    .catch((err)=>{
      console.log(err);
    })
}
});

app.listen(3000,function(){
    console.log("listening at 3000");
});
