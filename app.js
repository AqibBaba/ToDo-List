const express = require("express");  
const bodyParser = require("body-parser");

const mongoose = require("mongoose"); //for using mongo db

const _ = require("lodash");  //loadash for case issues

const app = express();

app.set('view engine', 'ejs');  //for templating purposes

app.use(bodyParser.urlencoded({ extended: true }));  //for gettting values from forms(i.e,inputs)
app.use(express.static("public"));     //for using dynamic code(such as hardcode css,hardcode html)

mongoose.connect("mongodb+srv://admin-aqib:Test123@cluster0.5nsda.mongodb.net/todolistDB");     //creating mongoose connection(connection string)

const itemsSchema = {             //creating item schema
  name: String
};

const Item = mongoose.model("Item", itemsSchema);       //creatimg model(or collection) for itemSchema


//now creating documents(entries,data) in item collection

const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];         //storing all documents into an array

const listSchema = {                      //creating anther listschema
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);            //creating another collection(or model)




app.get("/", function (req, res) {        //when user makes request to our home(root) page

  Item.find({}, function (err, foundItems) {        //finds all in items collection

    if (foundItems.length === 0) {    //checks founditems length is qual to 0,which is returned from callback function
      Item.insertMany(defaultItems, function (err) {  //if yes,thn imsert defaultitems[] in it
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully inserted");
        }
      });
      res.redirect("/");      //and redirect it to homepage
    } else {                                                                      //if upper condion fails
      res.render("list", { listTitle: "Today", newListItems: foundItems });       //thn simply return list page where list title is today and newlistitems are founditems(which we get by callback function)
    }
  });
});

app.get("/:customListName", function (req, res) {                 //get request for customlist
  const customListName = _.capitalize(req.params.customListName);   //capitalize customlistname



  List.findOne({ name: customListName }, function (err, foundList) {  //finds customlist exists which user has enterd
    if (!err) {                 //if no error
      if (!foundList) {  //if it is  not present
               
        const list = new List({                     // thn create new list   
          name: customListName,                   //customlistname=which user has enterd
          items: defaultItems                       //items=defaultitems[]
        });
        list.save();                            //save thit list into new list (customlistname)

        res.redirect("/" + customListName);         //and send custom list name to the user
      } else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items }); //if it exists thn return the previous version of it
      }
    }
  })
});

app.post("/", function (req, res) {             //when user posts(submits) request for adding new goals

  const itemName = req.body.newItem;  //get input value by newItem(which is name attribute)
  const listName = req.body.list;       //knowing from which list user has submitted the form via list(which is name attribute)

  const item = new Item({               //adding new item in our todolist
    name: itemName
  });
  if (listName === "Today") {     //now checks listname where to be added,if it is today then add it on home(root) page
    item.save();                //saveing item
    res.redirect("/");            //redirect it to homepage
  } else {
    List.findOne({ name: listName }, function (err, foundList) {        //else first finds the list name  
      foundList.items.push(item);                   //and push item on foundlist[] 
      foundList.save();                       //foundList save
      res.redirect("/" + listName);           //redirect it to listname page
    });
  }
});

app.post("/delete", function (req, res) {         //when user requests for delete request
  const checkedItemId = req.body.checkbox;        //check list item id via checkbox(which is by checkbox)
  const listName = req.body.listName;             //checks listname which is having hidden attribute

  if (listName === "Today") {                 //checks listname is today
    Item.findByIdAndRemove(checkedItemId, function (err) {    //Item find by  its id and  then remove
      if (!err) {
        console.log("Successfully deleted");
        res.redirect("/");
      }
    });
  }
  else {        
          //now finds in List and update that,by find query,pull that item from items array looks id   
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
      if (!err) {
        res.redirect("/" + listName);       //redirects it to listName
      }
    });
  }
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
