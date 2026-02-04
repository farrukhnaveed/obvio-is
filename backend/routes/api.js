var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: 'uploads/' });
const { processDocument } = require('../models/ingestModel');
const { search } = require('../models/searchModel');
const { Document } = require('../db/tables');
const Response = require('../helper/Response');

router.post('/ingest', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return new Response(res).setStatus(false).setStatusCode(400).setMessage('No file uploaded').setError('No file uploaded').send();
    }

    const { path: filePath, originalname: fileName, size, mimetype } = req.file;

    // Validate file size (max 2GB)
    const MAX_SIZE = 2 * 1024 * 1024 * 1024;
    if (size > MAX_SIZE) {
        return new Response(res).setStatus(false).setStatusCode(400).setMessage('File size exceeds 2GB limit').setError('File size exceeds 2GB limit').send();
    }

    // Validate file extension and mimetype
    const ext = path.extname(fileName).toLowerCase();
    if (ext !== '.txt' || mimetype !== 'text/plain') {
        return new Response(res).setStatus(false).setStatusCode(400).setMessage("Only .txt files with UTF-8 encoding are allowed").setError("Only .txt files with UTF-8 encoding are allowed").send();
    }

    try {
        const doc = await Document.create({ 
            name: fileName, 
            content: filePath,
            status: 'processing' 
        });

        processDocument(doc.id, filePath);
        new Response(res).setStatus(true).setStatusCode(202).setMessage("Ingestion started").setResult({ documentId: doc.id }).send();
    } catch (error) {
        new Response(res).setStatus(false).setStatusCode(500).setMessage("Failed to initiate ingestion").setError(error.message).send();
    }
});

router.get('/search', async (req, res) => {
    const { term } = req.query;

    if (!term) {
        return new Response(res).setStatus(false).setStatusCode(400).setMessage("Search term is required").setError("Search term is required").send();
    }

    try {
        const results = await search(term);

        return new Response(res).setStatus(true).setStatusCode(200).setMessage("Search results").setResult(results).send();

    } catch (error) {
        new Response(res).setStatus(false).setStatusCode(500).setMessage('Error occurred').setError(error.message).send();
    }
});

module.exports = router;
