const express = require('express')
require('dotenv').config()
const cors = require('cors')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const app = express()
app.use(cors())
app.use(bodyParser.json())

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Hello World!')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vjryr.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const servicesCollection = client.db("servicesdb").collection("services");
  const adminCollection = client.db("servicesdb").collection("admins");
  const reviewsCollection = client.db("servicesdb").collection("reviews");
  const orderCollection = client.db("servicesdb").collection("orders");
  console.log('db conntected')

  // insert single service
  app.post('/addServices', (req, res) => {
    const serviceReq = req.body;
    servicesCollection.insertOne(serviceReq)
      .then(result => {
        console.log(result)
      })
  })

  // insert admin
  app.post('/addAdmin', (req, res) => {
    const admin = req.body;
    adminCollection.insertOne(admin)
      .then(result => {
        console.log(result)
        res.send(result.insertedCount > 0)
      })
  })

  // insert review
  app.post('/addReview', (req, res) => {
    const review = req.body;
    reviewsCollection.insertOne(review)
      .then(result => {
        console.log(result)
        res.send(result.insertedCount > 0)
      })
  })


  //read review
  app.get('/getReview', (req, res) => {
    reviewsCollection.find({})
      .toArray((err, review) => {
        res.send(review)
      })
  })

  //read service
  app.get('/services', (req, res) => {
    servicesCollection.find({})
      .toArray((err, services) => {
        res.send(services)
      })
  })

  // insert orders
  app.post('/addOrder', (req, res) => {
    const order = req.body;
    orderCollection.insertOne(order)
      .then(result => {
        console.log(result)
        res.send(result.insertedCount > 0)
      })
  })

  app.patch('/update', (req, res) => {
    const order = req.body;
    orderCollection.updateOne({ _id: ObjectID(req.body.id) },
      { $set: {"status": req.body.status} }
    )
    .then(result => console.log(result))
  })

  //read order
  app.get('/getOrder', (req, res) => {
    orderCollection.find({})
      .toArray((err, orders) => {
        res.send(orders)
      })
  })

  //read data using filter by email from mongodb
  app.get('/userOrder', (req, res) => {
    orderCollection.find({ email: req.query.email })
      .toArray((err, items) => {
        res.send(items)
      })
  })

  //read data using filter by id from mongodb
  app.get('/getOrderData/:id', (req, res) => {
    const id = ObjectID(req.params.id);
    servicesCollection.find({ _id: id })
      .toArray((err, items) => {
        res.send(items)
        console.log(items);
      })
  })

  app.delete('/deleteService/:id', (req, res) => {
    console.log(req.params.id)
    servicesCollection.deleteOne({ _id: ObjectID(req.params.id) })
      .then(result => {
        console.log(result);
        res.send(result.deletedCount > 0)
      })
  })

  app.post('/loginBaseEmail', (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email })
      .toArray((err, admin) => {
        res.send(admin.length > 0)
      })
  })



});


app.listen(port)