const { selectArticleById, selectArticles } = require('../models/articles.models');

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
