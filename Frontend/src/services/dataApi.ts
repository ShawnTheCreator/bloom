// MongoDB Atlas Data API Integration
// Simpler alternative to Realm SDK for basic CRUD operations

const DATA_API_URL = 'https://data.mongodb-api.com/app/<YOUR_APP_ID>/endpoint/data/v1';
const API_KEY = '<YOUR_DATA_API_KEY>';
const DATABASE_NAME = 'Bloom';

// Helper function for Data API requests
async function dataApiRequest(action, body) {
  const response = await fetch(`${DATA_API_URL}/action/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'api-key': API_KEY,
    },
    body: JSON.stringify({
      dataSource: 'Cluster0',
      database: DATABASE_NAME,
      ...body
    })
  });

  if (!response.ok) {
    throw new Error(`Data API error: ${response.statusText}`);
  }

  return response.json();
}

// User operations (using 'User' collection)
export const dataApiUsers = {
  async createUser(userData) {
    return dataApiRequest('insertOne', {
      collection: 'User',
      document: userData
    });
  },

  async findUserByEmail(email) {
    return dataApiRequest('findOne', {
      collection: 'User',
      filter: { email }
    });
  },

  async updateUser(userId, updates) {
    return dataApiRequest('updateOne', {
      collection: 'User',
      filter: { _id: { $oid: userId } },
      update: { $set: updates }
    });
  },

  async findNearbyUsers(longitude, latitude, radiusMeters = 5000) {
    return dataApiRequest('find', {
      collection: 'User',
      filter: {
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: radiusMeters
          }
        }
      }
    });
  }
};

// Marketplace item operations (using 'MarketplaceItem' collection)
export const dataApiItems = {
  async createItem(itemData) {
    return dataApiRequest('insertOne', {
      collection: 'MarketplaceItem',
      document: {
        ...itemData,
        createdAt: { $date: new Date().toISOString() }
      }
    });
  },

  async findNearbyItems(longitude, latitude, radiusMeters = 10000) {
    return dataApiRequest('find', {
      collection: 'MarketplaceItem',
      filter: {
        status: 'active',
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: radiusMeters
          }
        }
      }
    });
  },

  async findItemsByCategory(category) {
    return dataApiRequest('find', {
      collection: 'MarketplaceItem',
      filter: { category, status: 'active' }
    });
  },

  async updateItem(itemId, updates) {
    return dataApiRequest('updateOne', {
      collection: 'MarketplaceItem',
      filter: { _id: { $oid: itemId } },
      update: { $set: updates }
    });
  }
};

// Conversation operations (using 'Conversation' collection)
export const dataApiConversations = {
  async createConversation(conversationData) {
    return dataApiRequest('insertOne', {
      collection: 'Conversation',
      document: conversationData
    });
  },

  async findUserConversations(userId) {
    return dataApiRequest('find', {
      collection: 'Conversation',
      filter: {
        'participants.userId': { $oid: userId }
      },
      sort: { updatedAt: -1 }
    });
  },

  async addMessage(conversationId, message) {
    return dataApiRequest('updateOne', {
      collection: 'Conversation',
      filter: { _id: { $oid: conversationId } },
      update: {
        $push: { messages: message },
        $set: {
          lastMessage: {
            text: message.text,
            senderId: message.senderId,
            senderName: message.senderName,
            createdAt: message.createdAt
          },
          updatedAt: new Date()
        }
      }
    });
  }
};

// Scan operations (using 'Scan' collection)
export const dataApiScans = {
  async createScan(scanData) {
    return dataApiRequest('insertOne', {
      collection: 'Scan',
      document: scanData
    });
  },

  async findUserScans(userId) {
    return dataApiRequest('find', {
      collection: 'Scan',
      filter: { userId: { $oid: userId } },
      sort: { createdAt: -1 }
    });
  },

  async updateScanStatus(scanId, status, listingId = null) {
    const update = { $set: { status, updatedAt: new Date() } };
    if (listingId) {
      update.$set.listingId = { $oid: listingId };
    }
    
    return dataApiRequest('updateOne', {
      collection: 'Scan',
      filter: { _id: { $oid: scanId } },
      update
    });
  }
};

// Grid operations (using 'Grid' collection)
export const dataApiGrids = {
  async findNearbyGrids(longitude, latitude, radiusMeters = 5000) {
    return dataApiRequest('find', {
      collection: 'Grid',
      filter: {
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: radiusMeters
          }
        }
      }
    });
  },

  async joinGrid(gridId, userId, username, avatar) {
    return dataApiRequest('updateOne', {
      collection: 'Grid',
      filter: { _id: { $oid: gridId } },
      update: {
        $push: {
          members: {
            userId: { $oid: userId },
            username,
            avatar,
            joinedAt: { $date: new Date().toISOString() },
            role: 'member'
          }
        },
        $inc: { 'stats.activeMembers': 1 }
      }
    });
  }
};

// Hive activity operations (using 'HiveActivity' collection)
export const dataApiActivities = {
  async findNearbyActivities(longitude, latitude, radiusMeters = 10000) {
    return dataApiRequest('find', {
      collection: 'HiveActivity',
      filter: {
        status: 'upcoming',
        startTime: { $gte: { $date: new Date().toISOString() } },
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: radiusMeters
          }
        }
      },
      sort: { startTime: 1 }
    });
  },

  async joinActivity(activityId, userId, username) {
    return dataApiRequest('updateOne', {
      collection: 'HiveActivity',
      filter: { _id: { $oid: activityId } },
      update: {
        $push: {
          participants: {
            userId: { $oid: userId },
            username,
            joinedAt: { $date: new Date().toISOString() }
          }
        },
        $inc: { currentParticipants: 1 }
      }
    });
  }
};

// Aggregation pipeline for complex queries (using PascalCase collections)
export const dataApiAggregate = {
  async getUserStats(userId) {
    return dataApiRequest('aggregate', {
      collection: 'MarketplaceItem',
      pipeline: [
        { $match: { 'seller.userId': { $oid: userId } } },
        {
          $group: {
            _id: null,
            totalItems: { $sum: 1 },
            totalRevenue: { $sum: '$price' },
            totalViews: { $sum: '$views' }
          }
        }
      ]
    });
  },

  async getPopularCategories() {
    return dataApiRequest('aggregate', {
      collection: 'MarketplaceItem',
      pipeline: [
        { $match: { status: 'active' } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]
    });
  }
};
