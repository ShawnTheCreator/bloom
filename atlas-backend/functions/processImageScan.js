// Atlas Function: processImageScan
// HTTP Endpoint for AI image scanning
// Triggered by React Native app when user scans an item

exports = async function(payload) {
  const { imageBase64, userId, location } = payload;
  
  try {
    // 1. Call Vision AI API (Google Vision or Azure Computer Vision)
    const visionResult = await callVisionAI(imageBase64);
    
    // 2. Parse results and estimate value
    const scanData = await parseScanResults(visionResult, userId, location);
    
    // 3. Save to Scan collection in Bloom database
    const scansCollection = context.services.get("mongodb-atlas").db("Bloom").collection("Scans");
    const result = await scansCollection.insertOne(scanData);
    
    // 4. Return processed data to frontend
    return {
      success: true,
      scanId: result.insertedId,
      detectedItem: scanData.detectedItem,
      estimatedValue: scanData.estimatedValue,
      sustainability: scanData.sustainability,
      message: "Item scanned successfully!"
    };
    
  } catch (error) {
    console.error("Scan processing failed:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to process image. Please try again."
    };
  }
};

// Call Vision AI API
async function callVisionAI(imageBase64) {
  const httpService = context.services.get("http");
  
  // Using Google Cloud Vision API
  const apiKey = context.values.get("GOOGLE_VISION_API_KEY");
  const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
  
  const response = await httpService.post({
    url: url,
    body: {
      requests: [{
        image: {
          content: imageBase64
        },
        features: [
          { type: "LABEL_DETECTION", maxResults: 10 },
          { type: "TEXT_DETECTION" },
          { type: "OBJECT_LOCALIZATION" }
        ]
      }]
    },
    headers: {
      "Content-Type": "application/json"
    }
  });
  
  return JSON.parse(response.body.text());
}

// Parse Vision AI results and estimate value
async function parseScanResults(visionResult, userId, location) {
  const labels = visionResult.responses[0]?.labelAnnotations || [];
  const textAnnotations = visionResult.responses[0]?.textAnnotations || [];
  const objects = visionResult.responses[0]?.localizedObjectAnnotations || [];
  
  // Extract item name from labels
  const itemName = labels[0]?.description || "Unknown Item";
  const category = categorizeItem(labels);
  const brand = extractBrand(textAnnotations);
  const condition = estimateCondition(labels, objects);
  
  // Estimate pricing (would call external API in production)
  const estimatedValue = await estimatePricing(itemName, category, brand, condition);
  
  // Calculate sustainability impact
  const sustainability = calculateSustainability(itemName, category);
  
  return {
    userId: new BSON.ObjectId(userId),
    rawImage: `data:image/jpeg;base64,${imageBase64.substring(0, 100)}...`, // Store reference, not full image
    rawText: textAnnotations.map(t => t.description).join(" "),
    detectedItem: {
      name: itemName,
      category: category,
      brand: brand,
      condition: condition,
      confidence: labels[0]?.score || 0.5
    },
    estimatedValue: {
      originalPrice: estimatedValue.original,
      resaleValue: estimatedValue.resale,
      currency: "USD"
    },
    sustainability: sustainability,
    status: "draft",
    location: location ? {
      coordinates: [location.longitude, location.latitude],
      address: location.address || ""
    } : null,
    metadata: {
      scannedAt: new Date(),
      deviceInfo: "React Native App",
      aiModel: "google-vision-v1"
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// Categorize item based on labels
function categorizeItem(labels) {
  const categories = {
    electronics: ["electronic", "device", "gadget", "phone", "laptop", "computer", "tablet"],
    furniture: ["furniture", "chair", "table", "couch", "sofa", "bed", "desk"],
    clothing: ["clothing", "shirt", "pants", "dress", "shoes", "jacket", "apparel"],
    appliances: ["appliance", "kitchen", "refrigerator", "microwave", "oven", "mixer"],
    books: ["book", "textbook", "novel", "magazine", "publication"],
    toys: ["toy", "game", "doll", "action figure", "puzzle"],
    sports: ["sports", "fitness", "exercise", "equipment", "ball"]
  };
  
  const labelTexts = labels.map(l => l.description.toLowerCase());
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(kw => labelTexts.some(lt => lt.includes(kw)))) {
      return category;
    }
  }
  
  return "other";
}

// Extract brand from text
function extractBrand(textAnnotations) {
  const brands = ["Apple", "Samsung", "Nike", "Adidas", "Sony", "KitchenAid", "IKEA", "HP", "Dell"];
  const text = textAnnotations.map(t => t.description).join(" ");
  
  for (const brand of brands) {
    if (text.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  return null;
}

// Estimate condition from labels and objects
function estimateCondition(labels, objects) {
  const labelTexts = labels.map(l => l.description.toLowerCase()).join(" ");
  
  if (labelTexts.includes("new") || labelTexts.includes("unused")) return "new";
  if (labelTexts.includes("excellent") || labelTexts.includes("perfect")) return "like-new";
  if (labelTexts.includes("worn") || labelTexts.includes("damaged")) return "fair";
  if (labelTexts.includes("broken") || labelTexts.includes("damaged")) return "poor";
  
  return "good"; // default
}

// Estimate pricing (mock function - replace with real API)
async function estimatePricing(itemName, category, brand, condition) {
  const baseValues = {
    electronics: 200,
    furniture: 150,
    clothing: 40,
    appliances: 100,
    books: 15,
    toys: 25,
    sports: 80,
    other: 50
  };
  
  let basePrice = baseValues[category] || 50;
  
  // Adjust for brand
  if (brand) basePrice *= 1.3;
  
  // Adjust for condition
  const conditionMultipliers = {
    "new": 0.8,
    "like-new": 0.7,
    "good": 0.5,
    "fair": 0.3,
    "poor": 0.15
  };
  
  const resalePrice = Math.round(basePrice * (conditionMultipliers[condition] || 0.5));
  
  return {
    original: basePrice,
    resale: resalePrice
  };
}

// Calculate sustainability impact
function calculateSustainability(itemName, category) {
  const co2Factors = {
    electronics: 50,
    furniture: 30,
    clothing: 15,
    appliances: 40,
    books: 5,
    toys: 8,
    sports: 20,
    other: 10
  };
  
  const wasteFactors = {
    electronics: 5,
    furniture: 15,
    clothing: 0.5,
    appliances: 10,
    books: 1,
    toys: 2,
    sports: 3,
    other: 2
  };
  
  return {
    co2SavedKg: co2Factors[category] || 10,
    wasteDivertedKg: wasteFactors[category] || 2
  };
}
