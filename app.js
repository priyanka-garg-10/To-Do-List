//jshint esversion:6
const express = require('express')
const bodyParser = require('body-parser')
const _ = require('lodash')
const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://priyanka:papr1002@cluster0.j4ahoa5.mongodb.net/?retryWrites=true&w=majority')

const app = express()
const port = 5000

// Set public folder as static folder for static files
app.use(express.static(__dirname + '/public'));

// parse application/json
app.use(bodyParser.json())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// Set EJS as templating engine
app.set('view engine', 'ejs'); 

const itemsSchema = {
    name: String
}

const items = mongoose.model('items', itemsSchema);


// Routing for home page
app.get('/', (req, res) => {
    items.find().then((itemlist) => {
        res.render('list', {
            listTitle: "Today",
            newListItem: itemlist
        });
    }).catch(err =>{
        res.render('list',{
            listTitle: "Today",
            newListItem:[]
        });
    })
})


app.post('/', (req, res) => {
    const listName = req.body.list;

    const item = new items({
        name: req.body.newItem
    })
    if(listName === "Today"){
        if (item.name == "") {
            console.log("Empty item");
        }
        else item.save();
        res.redirect('/');
    }
    else{
        List.findOne({name: listName}).then((foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect('/' + listName);
        })
    }
})


const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model('List', listSchema);



app.get('/:customListName', (req, res) => {
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({ name: customListName }).then(function (foundList) {
        if (!foundList) {
            //Create a new list
            const list = new List({
                name: customListName,
                items: []
            });
            list.save();
            res.redirect("/" + customListName);
        } else {
            //Show an existing list

            res.render("list", { listTitle: foundList.name, newListItem: foundList.items });
        }

    })
})


app.post('/delete', (req, res) => {
    const listName = req.body.listName;
    const checkedItemId = req.body.checkbox;

    if(listName === "Today"){
        items.findByIdAndRemove(checkedItemId).then((err) => {
            if (err) console.log(err);
            else console.log("Deleted");
        })
        res.redirect('/');
    }
    else{
        List.findOne({name: listName}).then((foundList) => {
            foundList.items.pull(checkedItemId);
            foundList.save();
        })
        res.redirect('/' + listName);
    }
})




app.listen(5000, function() {
  console.log("Server started on port 5000");
});