const { Document, Term, TermFrequency } = require('../db/tables');

module.exports.search = async queryTerm => {
    const term = queryTerm.toLowerCase();
    
    // 1. Get N (Total documents)
    const N = await Document.count();
    
    // 2. Get df(t) (Docs containing term)
    const termStats = await Term.findOne({ where: { word: term } });
    if (!termStats) return [];

    const df = termStats.docCount;

    // 3. Get all documents containing this term
    const occurrences = await TermFrequency.findAll({
        where: { word: term },
        include: [Document]
    });

    // 4. Calculate Scores
    const results = occurrences.map(occ => {
        const tf = occ.frequency;
        const score = tf * Math.log10(N / df);
        return {
            name: occ.Document.name,
            score: score,
            totalWords: occ.Document.totalWordCount,
            occurrenceCount: tf
        };
    });

    // 5. Sort: Higher score first, then alphabetical by name
    return results.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.name.localeCompare(b.name);
    }).slice(0, 3); // Return top 3
}
