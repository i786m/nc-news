const request = require("supertest");
const app = require("../app");
const db = require("../db/connection"); 
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");
const endpointsData = require('../endpoints.json')

beforeEach(() => {
    return seed(testData);
});

afterAll(() => {
    db.end(); 
});

describe("GET /api/topics", () => {

    test("200: should respond with an array with 3 topic objects, each of which will have slug and description properties", () => {
        return request(app)
            .get("/api/topics")
            .expect(200)
            .then(({ body }) => {
                const { topics } = body;
                expect(Array.isArray(topics)).toBe(true)
                expect(topics.length).toBe(3)
                topics.forEach((topic) => {
                    expect(typeof topic).toBe('object');
                    expect(topic).toHaveProperty("slug"), expect.any(String);
                    expect(topic).toHaveProperty("description"), expect.any(String);
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

describe('GET /api', () => { 
    test('200: should return a json object describing all the available endpoints on the API', () => { 
        return request(app)
        .get('/api')
        .expect(200)
        .then(({body})=>{
           expect(body.endpoints).toEqual(endpointsData);
        })       
    })
})

describe('GET /api/articles/:article_id', () => { 
    
    test('200: should respond with an article object with the following properties author, title, article_id, body, topic, created_at, votes and article_img_url', () => {
        return request(app)
        .get('/api/articles/1')
        .expect(200)
        .then(({body})=>{
            const expected = {
                article_id: 1,
                title: "Living in the shadow of a great man",
                topic: "mitch",
                author: "butter_bridge",
                body: "I find this existence challenging",
                created_at: "2020-07-09T20:11:00.000Z",
                votes: 100,
                article_img_url:
                  "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
              }
            expect(body.article).toEqual(expected);
     })
    })

    test('400: should return a 400 error with "Bad Request" as the message if passed a malformatted id e.g a string instead of a number', () => { 
        return request(app)
        .get('/api/articles/bananas')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Bad Request');
        }); })

    test('404: should return a 404 error with "Not Found" as the message if passed an id that doesnt exist', () => { 
        return request(app)
        .get('/api/articles/55')
        .expect(404)
        .then(({ body }) => {
        expect(body.msg).toBe('Not Found');
      });
     })
})