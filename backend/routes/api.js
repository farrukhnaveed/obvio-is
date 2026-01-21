var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: 'uploads/' });
const { processDocument } = require('../models/ingestModel');
const { search } = require('../models/searchModel');
const { Document } = require('../db/tables');

router.post('/ingest', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const { path: filePath, originalname: fileName, size, mimetype } = req.file;

    // Validate file size (max 2GB)
    const MAX_SIZE = 2 * 1024 * 1024 * 1024;
    if (size > MAX_SIZE) {
        return res.status(400).json({ error: "File size exceeds 2GB limit" });
    }

    // Validate file extension and mimetype
    const ext = path.extname(fileName).toLowerCase();
    if (ext !== '.txt' || mimetype !== 'text/plain') {
        return res.status(400).json({ error: "Only .txt files with UTF-8 encoding are allowed" });
    }

    try {
        const doc = await Document.create({ 
            name: fileName, 
            content: filePath,
            status: 'processing' 
        });

        processDocument(doc.id, filePath);
        res.status(202).json({ message: "Ingestion started", documentId: doc.id });
    } catch (error) {
        res.status(500).json({ error: "Failed to initiate ingestion" });
    }
});

router.get('/search', async (req, res) => {
    const { term } = req.query;

    if (!term) {
        return res.status(400).json({ error: "Search term is required" });
    }

    try {
        const results = await search(term);

        return res.json({ results });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
