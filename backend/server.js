const DEV_ENV = process.env.NODE_ENV === "dev";

if (DEV_ENV) require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const privateKey = require("./firebase-private-key.json");

const app = express();

admin.initializeApp({
  credential: admin.credential.cert(privateKey),
});

const verifyTokenMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) return res.sendStatus(400);

  try {
    const user = await admin.auth().verifyIdToken(req.headers.authorization);
    if (!user) return res.sendStatus(401);
    req.user = user;
    next();
  } catch (e) {
    console.log(e.message);
    return res.sendStatus(400);
  }
};

const except = (url, middleware, req, res, next) => {
  if (req.originalUrl === url) return next();
  middleware(req, res, next);
};

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use((req, res, next) =>
  except("/webhooks", bodyParser.json(), req, res, next)
);
app.use((req, res, next) =>
  except("/webhooks", verifyTokenMiddleware, req, res, next)
);

app.post("/make-admin", async (req, res) => {
  if (!req.body.email)
    return res.status(400).json({ error: "Something went wrong!" });
  if (!req.user.admin)
    return res.status(401).json({ error: "You can't make someone admin!" });

  try {
    const user = await admin.auth().getUserByEmail(req.body.email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    res.sendStatus(200);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/product/order", async (req, res) => {
  try {
    const items = req.body.items;

    if (
      !items ||
      !Array.isArray(items) ||
      !items.every((i) => typeof i === "object") ||
      !items.every(
        (i) => typeof i.id === "string" && typeof i.quantity === "number"
      )
    )
      return res.sendStatus(400);

    let databaseItems = [];
    const firestore = admin.firestore();

    for (let id in items) {
      const doc = await firestore
        .collection("products")
        .doc(items[id].id)
        .get();

      if (
        doc.exists &&
        doc.data().quantity > 0 &&
        doc.data().quantity >= items[id].quantity
      ) {
        let itemToBeAdded = { id: doc.id, ...doc.data() };
        itemToBeAdded.quantity = items[id].quantity;
        databaseItems.push(itemToBeAdded);
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: databaseItems.map((item) => ({
        price_data: {
          currency: "inr",
          unit_amount: item.price * 100,
          product_data: {
            name: item.name,
            images: [item.image],
          },
        },
        quantity: item.quantity,
      })),
      metadata: {
        itemIds: JSON.stringify(
          databaseItems.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          }))
        ),
      },
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/product/orders`,
      cancel_url: `${process.env.CLIENT_URL}/`,
      customer_email: req.user.email,
      client_reference_id: req.user.uid,
    });

    res.json({ checkoutURL: session.url });
  } catch (e) {
    console.log(e.message);
    res.sendStatus(400);
  }
});

app.post("/product/cancel", async (req, res) => {
  try {
    const itemId = req.body.item;
    if (!itemId || typeof itemId !== "string") return res.sendStatus(400);

    const firestore = admin.firestore();

    const doc = await firestore.collection("products").doc(itemId).get();
    const currentUserOrder =
      doc.data().reservedBy &&
      doc
        .data()
        .reservedBy.find((reserved) => reserved.email === req.user.email);

    if (!doc.exists || !currentUserOrder) return res.sendStatus(400);

    for (let id in currentUserOrder.paymentId) {
      const refund = await stripe.refunds.create({
        payment_intent: currentUserOrder.paymentId[id],
      });
    }

    await firestore
      .collection("products")
      .doc(doc.id)
      .update({
        reservedBy: admin.firestore.FieldValue.arrayRemove(currentUserOrder),
        quantity: admin.firestore.FieldValue.increment(
          currentUserOrder.quantity
        ),
      });

    res.sendStatus(200);
  } catch (e) {
    console.log(e.message);
    res.sendStatus(400);
  }
});

app.post(
  "/webhooks",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const signature = req.headers["stripe-signature"];
      const event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_ENDPOINT_SECRET
      );

      if (event.type === "checkout.session.completed") {
        const firestore = admin.firestore();

        const itemIds = JSON.parse(event.data.object.metadata.itemIds);
        const customerEmail = event.data.object.customer_email;
        const paymentId = event.data.object.payment_intent;

        for (let id in itemIds) {
          const doc = await firestore
            .collection("products")
            .doc(itemIds[id].id)
            .get();

          if (
            doc.data().reservedBy &&
            doc.data().reservedBy.find((order) => order.email === customerEmail)
          ) {
            await firestore
              .collection("products")
              .doc(itemIds[id].id)
              .update({
                reservedBy: doc.data().reservedBy.map((order) => {
                  if (order.email === customerEmail) {
                    order.paymentId = [...order.paymentId, paymentId];
                    order.quantity += itemIds[id].quantity;
                  }
                  return order;
                }),
                quantity: admin.firestore.FieldValue.increment(
                  -itemIds[id].quantity
                ),
              });
          } else {
            await firestore
              .collection("products")
              .doc(itemIds[id].id)
              .update({
                reservedBy: admin.firestore.FieldValue.arrayUnion({
                  email: customerEmail,
                  paymentId: [paymentId],
                  quantity: itemIds[id].quantity,
                }),
                quantity: admin.firestore.FieldValue.increment(
                  -itemIds[id].quantity
                ),
              });
          }
        }

        return res.sendStatus(200);
      }
    } catch (e) {
      console.log(e.message);
      res.sendStatus(400);
    }
  }
);

app.listen(process.env.PORT || 5000);
