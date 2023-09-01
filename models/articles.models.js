const db = require('../db/connection');
const format = require('pg-format')
const { query } = require("express");

exports.selectArticleById = (article_id) => {
	return db
		.query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id])
		.then(({ rows }) => {
			if (rows.length === 0) {
				return Promise.reject({ status: 404, msg: 'Not Found' });
			}
			return rows[0];
		});
};

exports.selectArticles = () => {
	return db
		.query(
		 `SELECT articles.author, articles.title, articles.article_id, 
      articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.article_id) AS comment_count
      FROM articles
      LEFT JOIN comments ON comments.article_id = articles.article_id
      GROUP BY articles.article_id
      ORDER BY articles.created_at DESC;`
		)
		.then(({ rows }) => rows);
};

exports.selectArticleComments = (article_id) => {
	
	const queryString = `SELECT comment_id, votes, created_at,author,body,article_id FROM comments WHERE article_id=$1 ORDER BY created_at DESC;`

	return db.query(queryString,[article_id]).then(({rows}) => rows)

};

exports.checkArticleIdExists = (articleId) => {
    const queryString = `SELECT author, title, article_id, body, topic, created_at, votes,article_img_url FROM articles WHERE article_id=%L;`;

    return db.query(format(queryString, articleId)).then(({ rows }) => {
        if (!rows.length) {
            return Promise.reject({ status: 404, msg: "Not found" });
        } else {
            return true;
        }
    });
};

exports.insertComment = (articleId, newComment) => {
    const queryString = `INSERT INTO comments (body, article_id, author) 
        VALUES %L RETURNING *;`;

    const newCommentValues = [[newComment.body, articleId, newComment.username]];
    return db.query(format(queryString, newCommentValues)).then((commentFromDB) => {
        return commentFromDB.rows[0];
    });
};


exports.updateArticle = (article_id, inc_votes) => {
    const queryString = `UPDATE articles SET votes=votes+%L WHERE article_id=%L RETURNING *;`
    return db.query(format(queryString, inc_votes, article_id)).then(({ rows }) => rows[0]);
}