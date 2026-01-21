
const fs = require('fs');
const { Document, Term, TermFrequency } = require('../db/tables');

module.exports.processDocument = async (docId, filePath) => {
    const termMap = {}; 
    let totalWords = 0;

    // I Used a stream to handle up to 2GB without crashing memory 
    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });

    for await (const chunk of stream) {
        const tokens = chunk.toLowerCase().split(/[^a-z0-9']+/);
        
        for (let token of tokens) {
            if (!token) continue;
            termMap[token] = (termMap[token] || 0) + 1;
            totalWords++;
        }
    }

    for (const [word, frequency] of Object.entries(termMap)) {
        // Update TF for this document
        await TermFrequency.create({ word, frequency, DocumentId: docId });

        // Update Global Document Frequency (df)
        const [termRecord, created] = await Term.findOrCreate({ 
            where: { word }, 
            defaults: { docCount: 1 } 
        });
        if (!created) await termRecord.increment('docCount');
    }

    await Document.update(
        { totalWordCount: totalWords, status: 'indexed' },
        { where: { id: docId } }
    );
}
