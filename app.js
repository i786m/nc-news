const express = require('express');
const { getTopics } = require( './controllers/topics.controllers' );
const { handleServerErrors, handlePsqlErrors, handleCustomErrors } = require( './errors/errors' );
const { getApiInfo } = require( './controllers/api.controllers' );
const { getArticlesById } = require( './controllers/articles.controllers' );

const app = express()

app.get('/api', getApiInfo)

app.get('/api/topics', getTopics)

app.get('/api/articles/:article_id', getArticlesById)

app.all('*', (_,res)=>{
    res.status(404).send({msg: 'Not Found'})
})

app.use(handlePsqlErrors)

app.use(handleCustomErrors)

app.use(handleServerErrors)

module.exports = app