import { supabase } from '../utils/supabaseClient.js';
import { authenticate } from '../plugins/authenticate.js';
import crypto from 'crypto';

export async function uploadRoutes(app) {
    await app.register(import('@fastify/multipart'));

    app.post('/upload-image', { preHandler: [authenticate] }, async function (req, reply) {
        const file = await req.file();
        const buffer = await file.toBuffer();

        const filename = `${crypto.randomUUID()}-${file.filename}`;

        const { data, error } = await supabase.storage
            .from('product-images')
            .upload(filename, buffer, {
                contentType: file.mimetype,
                upsert: true,
            });

        if (error) {
            return reply.code(500).send({ error: 'Upload failed', detail: error.message });
        }

        const { data: publicUrl } = supabase.storage
            .from('product-images')
            .getPublicUrl(filename);

        return { url: publicUrl.publicUrl };
    });
}
