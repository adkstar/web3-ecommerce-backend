const Koa = require("koa");
const Router = require("@koa/router");
const cors = require("@koa/cors");
const ethers = require("ethers");
const PaymentProcessor = require("../frontend/src/contracts/PaymentProcessor.json");
const { Payment } = require("./db.js");

const app = new Koa();
const router = new Router();

const items = {
  1: {
    id: "1",
    url: "http://downloaditem1",
  },
  2: {
    id: "2",
    url: "http://downloaditem2",
  },
};

router.get("/api/getPaymentId/:itemId", async (ctx) => {
  const paymentId = (Math.random() * 10000).toFixed(0);

  console.log("paymentId");
  console.log(paymentId);

  await Payment.create({
    id: paymentId,
    itemId: ctx.params.itemId,
    paid: false,
  });

  ctx.body = {
    paymentId,
  };
});

router.get("/api/getItemUrl/:paymentId", async (ctx) => {
  const payment = await Payment.findOne({ id: ctx.params.paymentId });

  console.log(
    "payment found::: ",
    ctx.params.paymentId,
    payment.id,
    payment.itemId,
    payment.paid
  );
  console.log(items[payment.itemId]);
  console.log(items[payment.itemId].url);
  if (payment && payment.paid) {
    ctx.body = {
      url: items[payment.itemId].url,
    };
  } else {
    ctx.body = {
      url: "",
    };
  }
});

app.use(cors()).use(router.routes()).use(router.allowedMethods());

app.listen(4000, () => console.log("Server running on port 4000"));

const listenToEvents = () => {
  const provider = new ethers.providers.JsonRpcProvider(
    "http://localhost:9545"
  );
  const networkId = "5777";

  const paymentProcessor = new ethers.Contract(
    PaymentProcessor.networks[networkId].address,
    PaymentProcessor.abi,
    provider
  );

  paymentProcessor.on("PaymentDone", async (payer, amount, paymentId, date) => {
    console.log(`
	 from: ${payer}
	 amount: ${amount}
	 paymentId: ${paymentId}
	 date: ${new Date(date.toNumber() * 1000).toLocaleString()}} 
	  `);

    Payment.findOne({ id: paymentId }).then((pmt) => {
      console.log("payment found", pmt, paymentId);
      pmt.paid = true;
      pmt.markModified("paid");
      pmt.save((err) => console.log(err));
    });
    // if (payment) {
    //   payment.paid = true;
    //   await payment.save();
    // }
  });
};

listenToEvents();
