const { nanoid } = require('nanoid');
const Url = require('../models/Url');

function isValidUrl(str) {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function toResponse(record, baseUrl) {
  return {
    shortCode: record.code,
    shortUrl: `${baseUrl}/${record.code}`,
    originalUrl: record.originalUrl,
    clicks: record.clicks,
    owner: record.owner || null,
    createdAt: record.createdAt
  };
}

async function generateUniqueCode() {
  let code;
  let exists = true;
  while (exists) {
    code = nanoid(6);
    // eslint-disable-next-line no-await-in-loop
    exists = await Url.exists({ code });
  }
  return code;
}

// POST /api/shorten
exports.shortenUrl = async (req, res, next) => {
  try {
    const { url, customCode } = req.body || {};
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    if (!url || typeof url !== 'string' || !isValidUrl(url)) {
      return res.status(400).json({ error: 'A valid "url" field is required.' });
    }

    let code = customCode;
    if (code) {
      if (!/^[a-zA-Z0-9_-]{3,20}$/.test(code)) {
        return res.status(400).json({
          error: 'customCode must be 3-20 characters (letters, numbers, - or _).'
        });
      }
      const taken = await Url.exists({ code });
      if (taken) {
        return res.status(409).json({ error: 'That custom code is already in use.' });
      }
    } else {
      code = await generateUniqueCode();
    }

    const record = await Url.create({
      code,
      originalUrl: url,
      owner: req.user ? req.user._id : null
    });

    res.status(201).json(toResponse(record, baseUrl));
  } catch (err) {
    next(err);
  }
}

// GET /api/urls  (own URLs, or all URLs if admin)
exports.listUrls = async (req, res, next) => {
  try {
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };

    const records = await Url.find(filter).sort({ createdAt: -1 });
    res.json(records.map((r) => toResponse(r, baseUrl)));
  } catch (err) {
    next(err);
  }
}

// GET /api/urls/:code
exports.getUrlStats= async (req, res, next) =>{
  try {
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const record = await Url.findOne({ code: req.params.code });

    if (!record) {
      return res.status(404).json({ error: 'Short URL not found.' });
    }

    res.json(toResponse(record, baseUrl));
  } catch (err) {
    next(err);
  }
}

// DELETE /api/urls/:code  (owner or admin only)
exports.deleteUrl =async(req, res, next) => {
  try {
    const record = await Url.findOne({ code: req.params.code });

    if (!record) {
      return res.status(404).json({ error: 'Short URL not found.' });
    }

    const isOwner = record.owner && record.owner.equals(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to delete this URL.' });
    }

    await record.deleteOne();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// GET /:code  (public redirect)
exports.redirectToOriginal = async (req, res, next)=> {
  try {
    const record = await Url.findOne({ code: req.params.code });

    if (!record) {
      return res.status(404).json({ error: 'Short URL not found.' });
    }

    record.clicks += 1;
    await record.save();

    res.redirect(302, record.originalUrl);
  } catch (err) {
    next(err);
  }
}