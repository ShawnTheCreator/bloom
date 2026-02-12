// Atlas Function: revenueCatWebhook
// Handles subscription events from RevenueCat
// Updates user subscription status in MongoDB

exports = async function(payload) {
  const { event } = payload;
  
  try {
    const usersCollection = context.services.get("mongodb-atlas").db("Bloom").collection("User");
    
    // Extract user info from RevenueCat event
    const revenueCatId = event.app_user_id;
    const eventType = event.event_type;
    const productId = event.product_id;
    
    // Find user by RevenueCat ID
    const user = await usersCollection.findOne({ "subscription.revenueCatId": revenueCatId });
    
    if (!user) {
      console.error(`User not found for RevenueCat ID: ${revenueCatId}`);
      return { success: false, error: "User not found" };
    }
    
    // Handle different event types
    switch (eventType) {
      case "INITIAL_PURCHASE":
      case "RENEWAL":
        await handleSubscriptionActive(usersCollection, user._id, productId, event);
        break;
        
      case "CANCELLATION":
      case "EXPIRATION":
        await handleSubscriptionExpired(usersCollection, user._id);
        break;
        
      case "PRODUCT_CHANGE":
        await handleProductChange(usersCollection, user._id, productId, event);
        break;
        
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
    
    return { success: true, message: `Processed ${eventType} for user ${user._id}` };
    
  } catch (error) {
    console.error("RevenueCat webhook failed:", error);
    return { success: false, error: error.message };
  }
};

// Handle new or renewed subscription
async function handleSubscriptionActive(collection, userId, productId, event) {
  const plan = determinePlan(productId);
  const expiresAt = event.expires_date_ms ? new Date(event.expires_date_ms) : null;
  
  await collection.updateOne(
    { _id: userId },
    {
      $set: {
        "subscription.isMamaPro": true,
        "subscription.plan": plan,
        "subscription.expiresAt": expiresAt,
        "subscription.lastUpdated": new Date()
      }
    }
  );
  
  console.log(`Activated ${plan} subscription for user ${userId}`);
}

// Handle cancelled/expired subscription
async function handleSubscriptionExpired(collection, userId) {
  await collection.updateOne(
    { _id: userId },
    {
      $set: {
        "subscription.isMamaPro": false,
        "subscription.plan": "free",
        "subscription.lastUpdated": new Date()
      }
    }
  );
  
  console.log(`Deactivated subscription for user ${userId}`);
}

// Handle product change (upgrade/downgrade)
async function handleProductChange(collection, userId, productId, event) {
  const plan = determinePlan(productId);
  
  await collection.updateOne(
    { _id: userId },
    {
      $set: {
        "subscription.plan": plan,
        "subscription.lastUpdated": new Date()
      }
    }
  );
  
  console.log(`Changed subscription to ${plan} for user ${userId}`);
}

// Determine plan from product ID
function determinePlan(productId) {
  if (productId.includes("monthly") || productId.includes("month")) {
    return "monthly";
  } else if (productId.includes("yearly") || productId.includes("year")) {
    return "yearly";
  }
  return "free";
}
