const { checkExists } = require('../db/seeds/utils');
const {
	selectArticleById,
	selectArticles,
	selectArticleComments,
	insertComment,
	checkArticleIdExists
} = require('../models/articles.models');
const { checkUsernameExists } = require('../models/users.models');

exports.getArticlesById = (req, res, next) => {
	const { article_id } = req.params;
	return selectArticleById(article_id)
		.then((article) => {
			res.status(200).send({ article });
		})
		.catch(next);
};

exports.getArticles = (req, res, next) => {
	return selectArticles()
		.then((articles) => {
			res.status(200).send({ articles });
		})
		.catch(next);
};

exports.getArticleComments = (req, res, next) => {
	const { article_id } = req.params;
	

	const promises = [selectArticleComments(article_id), checkExists('articles', 'article_id', article_id)]

	Promise.all(promises)
	.then(([comments, doesExist])=>{
		res.status(200).send({comments})
	})
	.catch(next)
};

exports.postComment = (req, res, next) => {
    const { article_id } = req.params;
    const newComment = req.body;
    const { username, body } = newComment;

	
    checkArticleIdExists(article_id)
        .then((exists) => {
            if (exists) {
                return checkUsernameExists(username);
            } else {
                return Promise.reject({ status: 404, msg: "Bad Request" });
            }
        })
        .then((exists) => {
            if (exists) {
				if(!username||!body){
					return Promise.reject({ status: 400, msg: "Bad Request" });
				}else return insertComment(article_id, newComment);
            } else {
                return Promise.reject({ status: 400, msg: "Bad Request" });
            }
        })
        .then((commentFromDB) => {
            res.status(201).send({ postedComment: commentFromDB });
        })
        .catch(next);
};