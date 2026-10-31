import { DB } from '../models/index.js';

export async function getActivityLogs(req, res) {
  try {
    const { action, role, search } = req.query;
    let logs = await DB.ActivityLog().find();

    if (role && role !== 'all') {
      logs = logs.filter(l => (l.userRole || '').toUpperCase() === role.toUpperCase());
    }
    if (action && action !== 'all') {
      logs = logs.filter(l => (l.action || '').toUpperCase() === action.toUpperCase());
    }
    if (search) {
      const q = search.toLowerCase();
      logs = logs.filter(l =>
        (l.userName && l.userName.toLowerCase().includes(q)) ||
        (l.description && l.description.toLowerCase().includes(q)) ||
        (l.action && l.action.toLowerCase().includes(q))
      );
    }

    logs.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
