const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const testData = require('../db/data/test-data');
const endpointsData = require('../endpoints.json');

beforeEach(() => {
	return seed(testData);
});

afterAll(() => {
	db.end();
});

describe('GET /api/topics', () => {
	test('200: should respond with an array with 3 topic objects, each of which will have slug and description properties', () => {
		return request(app)
			.get('/api/topics')
			.expect(200)
			.then(({ body }) => {
				const { topics } = body;
				expect(Array.isArray(topics)).toBe(true);
				expect(topics.length).toBe(3);
				topics.forEach((topic) => {
					expect(typeof topic).toBe('object');
					expect(topic).toHaveProperty('slug'), expect.any(String);
					expect(topic).toHaveProperty('description'), expect.any(String);
				});
			});
	});

	test("500: should respond with 'Server Error'", () => {
		return db
			.query(`DROP TABLE IF EXISTS comments;`)
			.then(() => {
				return db.query(`DROP TABLE IF EXISTS articles;`);
			})
			.then(() => {
				return db.query(`DROP TABLE IF EXISTS users;`);
			})
			.then(() => {
				return db.query(`DROP TABLE IF EXISTS topics;`);
			})
			.then(() => {
				return request(app)
					.get('/api/topics')
					.expect(500)
					.then(({ body }) => {
						const { msg } = body;
						expect(msg).toBe('Server Error');
					});
			});
	});
});

describe('GET /api', () => {
	test('200: should return a json object describing all the available endpoints on the API', () => {
		return request(app)
			.get('/api')
			.expect(200)
			.then(({ body }) => {
				expect(body.endpoints).toEqual(endpointsData);
			});
	});
});

describe('GET /api/articles/:article_id', () => {
	test('200: should respond with an article object with the following properties author, title, article_id, body, topic, created_at, votes and article_img_url', () => {
		return request(app)
			.get('/api/articles/1')
			.expect(200)
			.then(({ body }) => {
				const expected = {
					article_id: 1,
					title: 'Living in the shadow of a great man',
					topic: 'mitch',
					author: 'butter_bridge',
					body: 'I find this existence challenging',
					created_at: '2020-07-09T20:11:00.000Z',
					votes: 100,
					article_img_url:
						'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
				};
				expect(body.article).toEqual(expected);
			});
	});

	test('400: should return a 400 error with "Bad Request" as the message if passed a malformatted id e.g a string instead of a number', () => {
		return request(app)
			.get('/api/articles/bananas')
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe('Bad Request');
			});
	});

	test('404: should return a 404 error with "Not Found" as the message if passed an id that doesnt exist', () => {
		return request(app)
			.get('/api/articles/55')
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe('Not Found');
			});
	});
});

describe('GET /api/articles', () => {
	test('200: should respond with an array of all articles', () => {
		return request(app)
			.get('/api/articles')
			.expect(200)
			.then(({ body }) => {
				const { articles } = body;
				expect(articles).toBeInstanceOf(Array);
				expect(articles.length).toBe(13);
			});
	});

	test('200: should respond with an array of all article objects with each having the following properties: author, title, article_id, topic, created_at, votes, article_img_url, comment_count.', () => {
		return request(app)
			.get('/api/articles')
			.expect(200)
			.then(({ body }) => {
				const { articles } = body;
				articles.forEach((article) => {
					expect(article).toMatchObject({
						author: expect.any(String),
						title: expect.any(String),
						article_id: expect.any(Number),
						topic: expect.any(String),
						created_at: expect.any(String),
						votes: expect.any(Number),
						article_img_url: expect.any(String),
						comment_count: expect.any(String),
					});
				});
			});
	});

	test('200: should respond with an array containing all articles sorted by created_at in descending order.', () => {
		return request(app)
			.get('/api/articles')
			.expect(200)
			.then(({ body }) => {
				const { articles } = body;
				expect(articles).toBeSortedBy('created_at', { descending: true });
			});
	});

	test('200: should respond with an array containing all article objects with each not having a body property.', () => {
		return request(app)
			.get('/api/articles')
			.expect(200)
			.then(({ body }) => {
				const { articles } = body;
				articles.forEach((article) => {
					expect(article.hasOwnProperty(body)).toBe(false);
				});
			});
	});
});

describe('GET /api/articles/:article_id/comments', () => {
	test('200: should respond with an array of all comments objects each with comment_id, votes,created_at, author, body and article_id properties', () => {
		return request(app)
			.get('/api/articles/1/comments')
			.expect(200)
			.then(({ body }) => {
				const { comments } = body;
				expect(comments).toBeInstanceOf(Array);
				expect(comments).toHaveLength(11);
				comments.forEach((comment) => {
					expect(comment).toMatchObject({
						comment_id: expect.any(Number),
						votes: expect.any(Number),
						created_at: expect.any(String),
						author: expect.any(String),
						body: expect.any(String),
						article_id: 1,
					});
				});
			});
	});

	test('200: array retruned should be sorted by Created_at in descending order', () => {
		return request(app)
			.get('/api/articles/1/comments')
			.expect(200)
			.then(({ body }) => {
				const { comments } = body;
				expect(comments).toBeSortedBy('created_at', { descending: true });
			});
	});
	test('200: should return an empty array if no comments for associated article', () => {
		return request(app)
			.get('/api/articles/2/comments')
			.expect(200)
			.then(({ body }) => {
				const { comments } = body;
				expect(comments).toEqual([]);
			});
	});

	test('400: should return Bad Request when provided article_id is not valid', () => {
		return request(app)
			.get('/api/articles/bananas/comments')
			.expect(400)
			.then(({ body }) => {
				expect(body.msg).toBe('Bad Request');
			});
	});

	test('404: should return Resource not found when provided article_id is valid but non-existent', () => {
		return request(app)
			.get('/api/articles/555/comments')
			.expect(404)
			.then(({ body }) => {
				expect(body.msg).toBe('Resource not found');
			});
	});
});

describe('POST /api/articles/:article_id/comments', () => { 
	test('201: should update article with only relevant properties of a new comment and respond with an object of the posted comment', () => { 
		const testComment = {
			username: "lurker",
			body: 'testing posted comment',
		}

		return request(app)
            .post("/api/articles/1/comments")
            .send(testComment)
            .expect(201)
            .then(({ body }) => {
                const { postedComment } = body;

                expect(postedComment).toBeInstanceOf(Object);

                expect(postedComment).toMatchObject({
                    comment_id: 19,
                    body: "testing posted comment",
                    article_id: 1,
                    author: "lurker",
                    votes: 0,
                    created_at: expect.any(String),
                });
            });
	 })
	 
	 test("400: should respond with bad request when trying to post a comment with missing fields", () => {
        const testComment = {
			username:'lurker',
		}

        return request(app)
            .post("/api/articles/1/comments")
            .send(testComment)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("Bad Request");
            });
    });

    test("400: should respond with bad request when article id is an invalid type", () => {
        const testComment = {
			username: 'test',
			body: 'testing posted comments'
		}
        return request(app)
            .post("/api/articles/banana/comments")
            .send(testComment)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("Bad Request");
            });
    })

	test("404: should respond with not found if article id is a valid type but article doesnt exist ", () => { 
		const testComment = {
			username: 'test',
			body: 'testing posted comments'
		}
        return request(app)
            .post("/api/articles/45545654/comments")
            .send(testComment)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("Not found");
            });
	 })
 })

describe('CORE: PATCH /api/articles/:article_id', () => {
	test('200: should increase article votes and respond with updated article if provided valid positive input', () => {
		return request(app)
		.patch('/api/articles/1')
		.send({ inc_votes: 100 })
		.expect(200)
		.then(({ body }) => {
			const expected ={
				title: "Living in the shadow of a great man",
				topic: "mitch",
				author: "butter_bridge",
				body: "I find this existence challenging",
				created_at: "2020-07-09T20:11:00.000Z",
				votes: 200,
				article_id: 1,
				article_img_url:
				  "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
			  }
            const { article } = body;
			expect(article).toBeInstanceOf(Object);
			expect(article).toEqual(expected);
        });
	})
	test('200: should decrease article votes and respond with updated article if provided valid negative input', () => {
		return request(app)
		.patch('/api/articles/1')
		.send({ inc_votes: -40 })
		.expect(200)
		.then(({ body }) => {
			
            const { article } = body;
			expect(article.votes).toBe(60);
        });
	})
	test('400: should respond with bad request when provided article id is not valid', () =>{
		return request(app)
		.patch('/api/articles/bananas')
		.send({ inc_votes: 100 })
		.expect(400).then(({ body }) => {
			expect(body.msg).toBe('Bad Request');
		});
	})
	test('400: should respond with bad request when provided invalid body', () =>{
		return request(app)
		.patch('/api/articles/1')
		.send({ bananas: 100 })
		.expect(400).then(({ body }) => {
			expect(body.msg).toBe('Bad Request');
		});
	})
	test('404: should respond with not found when provided article id is valid but non-existent', () =>{
		return request(app)
		.patch('/api/articles/555')
		.send({ inc_votes: 100 })
		.expect(404).then(({ body }) => {
            expect(body.msg).toBe('Not found');
        });
	})
	
})
