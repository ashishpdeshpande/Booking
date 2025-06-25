import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
  try {
    // Create a svix instance with clerk webhook secret
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // Getting header
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    // Verifying headers
    await whook.verify(JSON.stringify(req.body), headers);

    // Getting data from request body
    const { data, type } = req.body;

    // Switch cases for different events
    switch (type) {
      case "user.created":
        try {
          const userData = {
            _id: data.id,
            email: data.email_addresses[0].email_address,
            username: data.first_name + " " + data.last_name,
            image: data.image_url,
          };

          await User.create(userData);
          console.log("✅ User created and saved to DB");
        } catch (err) {
          console.error("❌ Failed to save user to DB:", err.message);
        }
        break;

      case "user.updated": {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          username: data.first_name + " " + data.last_name,
          image: data.image_url,
        };

        await User.findByIdAndUpdate(data.id, userData);
        break;
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        break;
      }

      default:
        break;
    }

    res.json({
      success: true,
      message: "Webhook recieved",
    });
  } catch (err) {
    console.log(err.message);
    res.json({
      success: false,
      message: err.message,
    });
  }
};

export default clerkWebhooks;
