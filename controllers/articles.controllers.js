const { checkExists } = require('../db/seeds/utils');
const {
	selectArticleById,
	selectArticles,
	selectArticleComments,
} = require('../models/articles.models');

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
