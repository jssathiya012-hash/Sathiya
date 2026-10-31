import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data');
const dbFile = path.join(dataDir, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// In-memory / File-backed datastore for zero-config persistence
class MemoryStore {
  constructor() {
    this.data = {
      users: [],
      staff: [],
      customers: [],
      products: [],
      plans: [],
      subscriptions: [],
      payments: [],
      discounts: [],
      invoices: [],
      notifications: [],
      activityLogs: [],
      companySettings: []
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(dbFile)) {
        const raw = fs.readFileSync(dbFile, 'utf8');
        this.data = { ...this.data, ...JSON.parse(raw) };
      }
    } catch (err) {
      console.warn('Could not load local db.json, using fresh store', err.message);
    }
    // Ensure all collections are arrays
    for (const key of Object.keys(this.data)) {
      if (!Array.isArray(this.data[key])) {
        this.data[key] = [];
      }
    }
  }

  save() {
    try {
      fs.writeFileSync(dbFile, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to save to db.json', err.message);
    }
  }

  collection(name) {
    if (!this.data[name] || !Array.isArray(this.data[name])) {
      this.data[name] = [];
    }
    const self = this;
    const items = this.data[name];

    return {
      find: (filter = {}) => {
        return items.filter(item => {
          for (const [key, val] of Object.entries(filter)) {
            if (val !== undefined && item[key] !== val) return false;
          }
          return true;
        });
      },
      findOne: (filter = {}) => {
        return items.find(item => {
          for (const [key, val] of Object.entries(filter)) {
            if (val !== undefined && item[key] !== val) return false;
          }
          return true;
        }) || null;
      },
      findById: (id) => {
        return items.find(item => item._id === id || item.id === id) || null;
      },
      create: (doc) => {
        const newDoc = {
          _id: doc._id || 'id_' + Math.random().toString(36).substring(2, 11),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...doc
        };
        items.push(newDoc);
        self.save();
        return newDoc;
      },
      findByIdAndUpdate: (id, update) => {
        const idx = items.findIndex(item => item._id === id || item.id === id);
        if (idx === -1) return null;
        items[idx] = {
          ...items[idx],
          ...update,
          updatedAt: new Date().toISOString()
        };
        self.save();
        return items[idx];
      },
      findByIdAndDelete: (id) => {
        const idx = items.findIndex(item => item._id === id || item.id === id);
        if (idx === -1) return null;
        const deleted = items.splice(idx, 1)[0];
        self.save();
        return deleted;
      },
      countDocuments: (filter = {}) => {
        return items.filter(item => {
          for (const [key, val] of Object.entries(filter)) {
            if (val !== undefined && item[key] !== val) return false;
          }
          return true;
        }).length;
      }
    };
  }
}

export const memoryStore = new MemoryStore();
export let isMongooseConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartsub';
  try {
    // Attempt Mongoose connection with 2 second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    isMongooseConnected = true;
    console.log(' MongoDB connected via Mongoose:', uri);
  } catch (err) {
    isMongooseConnected = false;
    console.log(' Local MongoDB service not active. Switched to persistent JSON store (data/db.json).');
  }
}
