const express = require("express");
const cors = require("cors");
const { getTopics } = require("./controllers/topics.controllers");
const {
  handleServerErrors,
  handlePsqlErrors,
  handleCustomErrors,
} = require("./errors/errors");
const { getApiInfo } = require("./controllers/api.controllers");
const {
  getArticlesById,
  getArticles,
  getArticleComments,
  postComment,
  patchArticle,
} = require("./controllers/articles.controllers");

const app = express();

app.use(cors());

app.use(express.json());

app.get("/api", getApiInfo);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticlesById);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getArticleComments);

app.post("/api/articles/:article_id/comments", postComment);

app.patch("/api/articles/:article_id", patchArticle);

app.all("*", (_, res) => {
  res.status(404).send({ msg: "Not Found" });
});

app.use(handlePsqlErrors);

app.use(handleCustomErrors);

app.use(handleServerErrors);

module.exports = app;