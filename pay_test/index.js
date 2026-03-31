const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const conekta = require("conekta");

conekta.api_key = "key_Bg0jUyakqhMoGgXSEPtjGln";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Crear suscripción
app.post("/crear-suscripcion", async (req, res) => {
  try {
    const { token, name, email } = req.body;

    const customer = await conekta.Customer.create({
      name: name,
      email: email,
      payment_sources: [{
        type: "card",
        token_id: token
      }]
    });

    const subscription = await conekta.Subscription.create({
      customer_id: customer.id,
      plan: "plan_mensual_299"
    });

    res.json({
      success: true,
      customer_id: customer.id,
      subscription_id: subscription.id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Webhook
app.post("/webhook", (req, res) => {
  const event = req.body;

  console.log("Evento:", event.type);

  if (event.type === "subscription_paid") {
    console.log("Pago exitoso");
  }

  if (event.type === "payment_failed") {
    console.log("Pago fallido");
  }

  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});