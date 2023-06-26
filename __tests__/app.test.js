const request = require("supertest");
const app = require("../app");
const db = require("../db/connection"); 
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");



beforeEach(() => {
    return seed(testData);
});

afterAll(() => {
    db.end(); 
});

describe("GET /api/topics", () => {
    
    test('200: should return an array', () => { 
        return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
            const { topics } = body;
            expect(Array.isArray(topics)).toBe(true);
            });
        });

    test('200: should return an array with 3 topic objects', () => { 
        return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
            const { topics } = body;
            expect(topics.length).toBe(3);
            });
        });

    test("200: should respond with an array with all topic objects, each of which will have slug and description properties", () => {
        return request(app)
            .get("/api/topics")
            .expect(200)
            .then(({ body }) => {
                const { topics } = body;
                topics.forEach((el) => {
                    expect(typeof el).toBe('object');
                    expect(el).toHaveProperty("slug"), expect.any(String);
                    expect(el).toHaveProperty("description"), expect.any(String);
                });
            });
    })

    test("500: should respond with 'Server Error'", () => {
        return db.query(`DROP TABLE IF EXISTS comments;`)
            .then(() => {return db.query(`DROP TABLE IF EXISTS articles;`)})
            .then(() => {return db.query(`DROP TABLE IF EXISTS users;`)})
            .then(() => {return db.query(`DROP TABLE IF EXISTS topics;`)})
            .then(()=>{
                return request(app)
                    .get("/api/topics")
                    .expect(500)
                    .then(({body}) => {
                        const { msg } = body;
                        expect(msg).toBe('Server Error');
                    });
            })
           

    })

})