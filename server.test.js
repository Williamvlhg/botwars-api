import request from 'supertest';
import { app, server, wss } from './server.js';

describe('GET /', () => {

    it('should serve the HTML page', async () => {
        await request(app)
            .get('/')
            .expect('Content-Type', /html/) 
            .expect(200);
    });


});