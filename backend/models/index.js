import { memoryStore, isMongooseConnected } from '../config/db.js';
import * as MongooseModels from './schemas.js';

export function getModel(modelName) {
  // If connected to MongoDB, return the Mongoose model
  if (isMongooseConnected && MongooseModels[modelName]) {
    return MongooseModels[modelName];
  }

  // Otherwise return memoryStore collection interface
  const collectionName = modelName.charAt(0).toLowerCase() + modelName.slice(1) + (modelName.endsWith('s') ? '' : 's');
  // special mappings
  const keyMap = {
    CompanySettings: 'companySettings',
    ActivityLog: 'activityLogs'
  };
  const key = keyMap[modelName] || collectionName;
  return memoryStore.collection(key);
}

export const DB = {
  User: () => getModel('User'),
  Staff: () => getModel('Staff'),
  Customer: () => getModel('Customer'),
  Product: () => getModel('Product'),
  Plan: () => getModel('Plan'),
  Subscription: () => getModel('Subscription'),
  Payment: () => getModel('Payment'),
  Discount: () => getModel('Discount'),
  Invoice: () => getModel('Invoice'),
  Notification: () => getModel('Notification'),
  ActivityLog: () => getModel('ActivityLog'),
  CompanySettings: () => getModel('CompanySettings')
};
