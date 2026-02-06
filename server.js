import 'dotenv/config';
import express from 'express';
import companion from '@uppy/companion';

const app = express();
const port = process.env.PORT || 3020;

// Helper to sanitize filename (same as frontend)
function sanitizeFilename(filename) {
    return filename
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9._-]/g, '')
        .replace(/_{2,}/g, '_');
}

const options = {
    s3: {
        endpoint: process.env.SUPABASE_S3_ENDPOINT,
        region: process.env.SUPABASE_S3_REGION,
        bucket: process.env.SUPABASE_S3_BUCKET,
        key: process.env.SUPABASE_S3_ACCESS_KEY,
        secret: process.env.SUPABASE_S3_SECRET_KEY,
        forcePathStyle: true,
        getKey: (req, filename, metadata) => {
            const meta = metadata || {};
            const userId = meta.user_id || 'unknown';
            const safe = sanitizeFilename(filename);
            const key = `documents/${userId}/${safe}`;
            console.log(`[Companion] S3 Key: ${key}`);
            return key;
        }
    },
    server: {
        host: process.env.COMPANION_DOMAIN || ('localhost:' + port),
        protocol: process.env.COMPANION_PROTOCOL || 'http',
    },
    corsOrigins: process.env.COMPANION_CORS_ORIGINS ? process.env.COMPANION_CORS_ORIGINS.split(',') : true,
    uploadUrls: ['http://localhost:' + port],
    filePath: 'uploads',
    secret: 'uppy-anko-integrated',
    debug: true
};

const { app: companionApp } = companion.app(options);
app.use('/companion', companionApp);

// Error Handler
app.use((err, req, res, next) => {
    console.error('[Companion Global Error]:', err);
    if (!res.headersSent) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Companion is alive' });
});

// Export app for Vercel
export default app;

// Only listen if run directly (not imported as a module)
if (import.meta.url === `file://${process.argv[1]}`) {
    const server = app.listen(port, '127.0.0.1', () => {
        console.log(`Uppy Companion integrated running on http://127.0.0.1:${port}`);
    });

    companion.socket(server);
}
