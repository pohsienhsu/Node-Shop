const mongodb = require("mongodb");
const { MongoClient, ServerApiVersion } = mongodb;

let _db;

const uri = `mongodb+srv://${process.env["MONGO_USER"]}:${process.env["MONGO_PASSWORD"]}@${process.env["MONGO_CLUSTER"]}/${process.env["MONGO_DATABASE"]}?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const mongoConnect = (cb) => {
  client
    .connect()
    .then((client) => {
      console.log("Connected!");
      _db = client.db();
      cb();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found!";
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
