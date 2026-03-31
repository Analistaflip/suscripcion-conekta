const express = require("express");
const cors = require("cors");
const conekta = require("conekta");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

conekta.api_key = process.env.CONEKTA_API_KEY;

// Ruta para crear suscripción
app.post("/crear-suscripcion", async (req, res) => {
  try {
    const { token, name, email } = req.body;

    if (!token || !name || !email) {
      return res.status(400).json({
        success: false,
        error: "Faltan token, name o email"
      });
    }

    const customer = await conekta.Customer.create({
      name,
      email,
      payment_sources: [
        {
          type: "card",
          token_id: token
        }
      ]
    });

    const subscription = await conekta.Subscription.create({
      customer_id: customer.id,
      plan: "plan_mensual_299"
    });

    return res.json({
      success: true,
      customer_id: customer.id,
      subscription_id: subscription.id
    });
  } catch (err) {
    console.error("Error al crear suscripción:", err);

    return res.status(500).json({
      success: false,
      error: err?.message || "Error interno"
    });
  }
});

// Webhook
app.post("/webhook", (req, res) => {
  console.log("Webhook recibido:", req.body);
  res.sendStatus(200);
});

// Para abrir la web desde el mismo backend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});