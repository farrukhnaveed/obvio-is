const request = require('supertest');
const express = require('express');
const router = require('../routes/api');
const { Document, Term, TermFrequency } = require('../db/tables');
const { processDocument } = require('../models/ingestModel');

// Mock the ingestion model to control async behavior in tests
jest.mock('../models/ingestModel');

const app = express();
app.use(express.json());
app.use('/', router);

describe('Search Engine API Requirements', () => {
    
    beforeEach(async () => {
        await TermFrequency.destroy({ where: {}, truncate: true });
        await Term.destroy({ where: {}, truncate: true });
        await Document.destroy({ where: {}, truncate: true });
    });

    describe('POST /ingest', () => {
        it('should only allow .txt files', async () => {
            const res = await request(app)
                .post('/ingest')
                .attach('file', Buffer.from('test content'), 'document.pdf');
            
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toMatch(/Only .txt files/);
        });

        it('should return 202 Accepted and start ingestion asynchronously', async () => {
            const res = await request(app)
                .post('/ingest')
                .attach('file', Buffer.from('hello world'), 'p_1.txt');
            
            expect(res.statusCode).toBe(202); // 
            expect(processDocument).toHaveBeenCalled(); 
        });
    });

    describe('GET /search', () => {
        it('should return top 3 documents ranked by TF-IDF', async () => {
            // Setup Mock Data
            // Document 1: "hello world" (N=2, df("world")=2, TF("world", p1)=1)
            // Document 2: "this is is world" (N=2, df("world")=2, TF("world", p2)=1)

            await Document.bulkCreate([
                { id: 1, name: 'p_1.txt', status: 'indexed', content: 'asldfkjasdlfkadll' },
                { id: 2, name: 'p_2.txt', status: 'indexed', content: 'asldfkjasdlfkadll' }
            ]);

            await Term.create({ word: 'world', docCount: 2 });
            
            await TermFrequency.bulkCreate([
                { word: 'world', frequency: 1, DocumentId: 1 },
                { word: 'world', frequency: 1, DocumentId: 2 }
            ]);

            const res = await request(app).get('/search?term=world');
            
            expect(res.statusCode).toBe(200);
            expect(res.body.results.length).toBeLessThanOrEqual(3);

            expect(res.body.results[0].name).toBe('p_1.txt');
            expect(res.body.results[1].name).toBe('p_2.txt');
        });

        it('should be case-insensitive', async () => {
            await Document.create({ id: 3, name: 'test.txt', status: 'indexed', content: 'asldfkjasdlfkadll' });
            await Term.create({ word: 'hello', docCount: 1 });
            await TermFrequency.create({ word: 'hello', frequency: 1, DocumentId: 3 });

            // Query with Uppercase, should match lowercase index
            const res = await request(app).get('/search?term=HELLO');
            
            expect(res.body.results[0].name).toContain('test.txt');
        });

        it('should return empty array for non-existent terms', async () => {
            const res = await request(app).get('/search?term=nonexistent');
            expect(res.body.results).toEqual([]);
        });
    });
});
