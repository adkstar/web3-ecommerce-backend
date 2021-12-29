const mongoose = require("mongoose");
mongoose.connect(
  //   "mongodb+srv://adkstar:adkstar@cluster0.snoio.mongodb.net/blockchain-commerce?retryWrites=true&w=majority",
  "mongodb://localhost:27017/blockchain?readPreference=primary&appname=MongoDB%20Compass&ssl=false",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const paymentSchema = new mongoose.Schema({
  id: String,
  itemId: String,
  paid: Boolean,
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = { Payment };
